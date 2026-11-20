-- DJ Item Dump: reads the game's own tooltip for every item the website lists
-- (ItemIDs.lua, written by scripts/item-dump/make-ids.py) and keeps it in
-- DJItemDumpDB. /reload or logging out writes that to
-- WTF/Account/<account>/SavedVariables/DJItemDump.lua, which
-- scripts/item-dump/to-json.py turns into data/item-tooltips.json.
--
--   /djdump          start (or carry on after a /reload)
--   /djdump refresh  read every saved tooltip again (late spell text)
--   /djdump status   how far it got
--   /djdump reset    forget everything and start over
--   /djdump talents  save every talent rank's text (DJTalentDump.lua)
--
-- It reads tooltips as data (C_TooltipInfo), so lines other addons add to
-- tooltips on screen never end up in it.
--
-- 1.1.0: an item's spell text ("Chance on hit: ...", "Equip: ...") reaches the
-- client a moment after the item, so a tooltip read as soon as the item loads
-- can lack it (Ironforge Greathammer, M 20 Nov 2026). After the loading pass
-- every tooltip is read again, a few seconds apart, until a pass changes
-- nothing (at most MAX_PASSES).
--
-- 1.2.0: reading the tooltip as data does not ask the game for what is
-- missing (a spell's text, a set's other pieces, a recipe's crafted item); a
-- drawn tooltip does, as when you hover an item. So each pass first draws
-- every item in a hidden tooltip (never read: other addons add lines to it),
-- waits, then reads the data. And a tooltip is only ever replaced by a more
-- complete one: a later read that got less never overwrites a better one.
--
-- 1.3.0: some text never reaches the data read at all, only the drawn tooltip
-- (Ironforge Greathammer's "Chance on hit", a set's other pieces, a recipe's
-- crafted item). So the drawn tooltip is read too and merged in: the two are
-- lined up line by line; a line only the drawn tooltip has is kept where it
-- stands among the game's lines, and everything after the game's last line is
-- left out, since that is where other addons add theirs.

local PER_FRAME = 15        -- item requests started per frame
local GIVE_UP_AFTER = 20    -- seconds without progress before calling it done
local RECHECK_PER_FRAME = 40 -- tooltips re-read per frame (already cached: cheap)
local RECHECK_DELAY = 4     -- seconds between passes, for spell text to arrive
local MAX_PASSES = 6

local IDS = DJItemDump_IDS or {}
local queue, pending, running = {}, 0, false
local lastProgress, startedAt = 0, 0
local driver = CreateFrame("Frame")

local function Say(msg) print("|cffd8a83cDJ Item Dump:|r " .. msg) end

local function DB()
    DJItemDumpDB = DJItemDumpDB or {}
    DJItemDumpDB.items = DJItemDumpDB.items or {}
    DJItemDumpDB.missing = DJItemDumpDB.missing or {}
    DJItemDumpDB.icons = DJItemDumpDB.icons or {}
    return DJItemDumpDB
end

local function Hex(c)
    if type(c) ~= "table" then return nil end
    if c.GenerateHexColor then
        local ok, h = pcall(c.GenerateHexColor, c)
        if ok and h then return h end
    end
    if c.r then return string.format("ff%02x%02x%02x", c.r * 255, c.g * 255, c.b * 255) end
    return nil
end

-- The tooltip as data. Each line: left text and colour, right text and colour,
-- and the sell price in copper on the price line.
local function ReadData(id)
    local ok, data = pcall(C_TooltipInfo.GetItemByID, id)
    if not ok or type(data) ~= "table" or type(data.lines) ~= "table" then return nil end
    if TooltipUtil and TooltipUtil.SurfaceArgs then pcall(TooltipUtil.SurfaceArgs, data) end
    local out = {}
    for _, line in ipairs(data.lines) do
        if TooltipUtil and TooltipUtil.SurfaceArgs then pcall(TooltipUtil.SurfaceArgs, line) end
        out[#out + 1] = {
            l = line.leftText or "", lc = Hex(line.leftColor),
            r = line.rightText, rc = Hex(line.rightColor),
            price = line.price,
        }
    end
    return out
end

-- Older clients without C_TooltipInfo: a hidden tooltip frame, read line by line.
local scan
local function ReadFrame(id)
    if not scan then
        scan = CreateFrame("GameTooltip", "DJItemDumpScanTip", nil, "GameTooltipTemplate")
    end
    scan:SetOwner(WorldFrame, "ANCHOR_NONE")
    scan:ClearLines()
    scan:SetHyperlink("item:" .. id)
    local out = {}
    for i = 1, scan:NumLines() do
        local L, R = _G["DJItemDumpScanTipTextLeft" .. i], _G["DJItemDumpScanTipTextRight" .. i]
        local l = L and L:GetText() or ""
        local r = R and R:IsShown() and R:GetText() or nil
        local lr, lg, lb = 1, 1, 1
        if L then lr, lg, lb = L:GetTextColor() end
        local rc
        if r and R then local rr, rg, rb = R:GetTextColor(); rc = Hex({ r = rr, g = rg, b = rb }) end
        out[#out + 1] = { l = l, lc = Hex({ r = lr, g = lg, b = lb }), r = r, rc = rc }
    end
    scan:Hide()
    return out
end

local function Read(id)
    local lines = (C_TooltipInfo and C_TooltipInfo.GetItemByID) and ReadData(id) or ReadFrame(id)
    if not lines or #lines == 0 then return nil end
    local first = lines[1].l or ""
    if first == "" or first:find(RETRIEVING_ITEM_INFO or "Retrieving item information", 1, true) then return nil end
    return lines
end

-- The icon's file ID, for scripts/item-dump/fetch-icons.py.
local function IconOf(id)
    if C_Item and C_Item.GetItemIconByID then
        local ok, icon = pcall(C_Item.GetItemIconByID, id)
        if ok and type(icon) == "number" and icon > 0 then return icon end
    end
    local info = (C_Item and C_Item.GetItemInfoInstant) or GetItemInfoInstant
    if info then
        local ok, _, _, _, _, icon = pcall(info, id)
        if ok and type(icon) == "number" and icon > 0 then return icon end
    end
    return nil
end

local function Store(id)
    DB().icons[id] = IconOf(id) or DB().icons[id]
    local lines = Read(id)
    if lines then
        DB().items[id] = lines
        DB().missing[id] = nil
    else
        DB().missing[id] = true
    end
    lastProgress = GetTime()
end

local function Count()
    local n = 0
    for _ in pairs(DB().items) do n = n + 1 end
    return n
end

local function AllDone()
    running = false
    driver:SetScript("OnUpdate", nil)
    local missing = 0
    for _, id in ipairs(IDS) do if not DB().items[id] then missing = missing + 1 end end
    DB().finishedAt = time()
    DB().version = 2
    Say(string.format("done: %d of %d items saved (%d the game did not know). Type /reload to write the file, then run scripts/item-dump/to-json.py.",
        Count(), #IDS, missing))
end

-- How much a read says: all its text. More is a more complete read.
local function Score(lines)
    local n = 0
    for _, line in ipairs(lines or {}) do n = n + #(line.l or "") + #(line.r or "") end
    return n
end

-- A drawn tooltip, never read: drawing an item makes the game fetch what the
-- tooltip still lacks (spell text, set pieces, crafted item), as hovering does.
local warmTip
local function Warm(id)
    if not warmTip then
        warmTip = CreateFrame("GameTooltip", "DJItemDumpWarmTip", nil, "GameTooltipTemplate")
    end
    warmTip:SetOwner(WorldFrame, "ANCHOR_NONE")
    if warmTip.SetItemByID then pcall(warmTip.SetItemByID, warmTip, id) else pcall(warmTip.SetHyperlink, warmTip, "item:" .. id) end
    warmTip:Hide()
end

-- The drawn tooltip, line by line, with colours (read after it was warmed).
local function ReadDrawn(id)
    if not warmTip then return nil end
    warmTip:SetOwner(WorldFrame, "ANCHOR_NONE")
    if warmTip.SetItemByID then pcall(warmTip.SetItemByID, warmTip, id) else pcall(warmTip.SetHyperlink, warmTip, "item:" .. id) end
    local out = {}
    for i = 1, warmTip:NumLines() do
        local L = _G["DJItemDumpWarmTipTextLeft" .. i]
        local R = _G["DJItemDumpWarmTipTextRight" .. i]
        local l = L and L:GetText() or ""
        local r = R and R:IsShown() and R:GetText() or nil
        local lr, lg, lb = 1, 1, 1
        if L then lr, lg, lb = L:GetTextColor() end
        local rc
        if r and R then local rr, rg, rb = R:GetTextColor(); rc = Hex({ r = rr, g = rg, b = rb }) end
        out[#out + 1] = { l = l, lc = Hex({ r = lr, g = lg, b = lb }), r = r, rc = rc }
    end
    warmTip:Hide()
    return out
end

local function Key(line)
    local t = (line.l or ""):gsub("^%s+", ""):gsub("%s+$", "")
    if line.price or t:find("^Sell Price") then return "#price" end
    -- a set's header counts the pieces it knows of: "(0/3)" and "(0/8)" are one line
    t = t:gsub("%s*%(%d+/%d+%)$", "")
    return t
end

-- Two lines that line up: the drawn one when its text differs (the game
-- finished it: a set header counting all its pieces), else the data one
-- (it keeps the sell price).
local function Pick(dataLine, drawnLine)
    if dataLine.price then return dataLine end
    if (drawnLine.l or "") ~= (dataLine.l or "") or (drawnLine.r or "") ~= (dataLine.r or "") then return drawnLine end
    return dataLine
end

-- The data read, with the lines only the drawn tooltip has put in their place.
-- Lines are lined up by their text (longest common subsequence); drawn-only
-- lines after the last line both share are other addons' and are dropped.
local function Merge(data, drawn)
    if not data then return nil end
    if not drawn or #drawn == 0 then return data end
    local n, m = #data, #drawn
    local L = {}
    for i = 0, n do L[i] = {}; for j = 0, m do L[i][j] = 0 end end
    for i = n - 1, 0, -1 do
        for j = m - 1, 0, -1 do
            if Key(data[i + 1]) == Key(drawn[j + 1]) then
                L[i][j] = L[i + 1][j + 1] + 1
            else
                L[i][j] = math.max(L[i + 1][j], L[i][j + 1])
            end
        end
    end
    local lastShared = 0
    do
        local i, j = 0, 0
        while i < n and j < m do
            if Key(data[i + 1]) == Key(drawn[j + 1]) then lastShared = j + 1; i = i + 1; j = j + 1
            elseif L[i + 1][j] >= L[i][j + 1] then i = i + 1
            else j = j + 1 end
        end
    end
    local out, i, j = {}, 0, 0
    while i < n or j < m do
        if i < n and j < m and Key(data[i + 1]) == Key(drawn[j + 1]) then
            out[#out + 1] = Pick(data[i + 1], drawn[j + 1]); i = i + 1; j = j + 1
        elseif j < m and (i >= n or L[i][j + 1] >= L[i + 1][j]) then
            if j + 1 < lastShared and (drawn[j + 1].l or "") ~= "" then out[#out + 1] = drawn[j + 1] end
            j = j + 1
        else
            out[#out + 1] = data[i + 1]; i = i + 1
        end
    end
    return out
end

local recheck, pass, changed = {}, 0, 0
local StartRecheck

local function ReadStep()
    for _ = 1, RECHECK_PER_FRAME do
        local id = table.remove(recheck)
        if not id then break end
        DB().icons[id] = IconOf(id) or DB().icons[id]
        local lines = Merge(Read(id), ReadDrawn(id))
        if lines and Score(lines) > Score(DB().items[id]) then
            DB().items[id] = lines
            DB().missing[id] = nil
            changed = changed + 1
        end
    end
    if #recheck == 0 then
        driver:SetScript("OnUpdate", nil)
        if changed > 0 and pass < MAX_PASSES then
            Say(string.format("pass %d: %d tooltips got more complete; another pass...", pass, changed))
            C_Timer.After(1, StartRecheck)
        else
            AllDone()
        end
    end
end

local function StartRead()
    wipe(recheck)
    for _, id in ipairs(IDS) do recheck[#recheck + 1] = id end
    driver:SetScript("OnUpdate", ReadStep)
end

local function WarmStep()
    for _ = 1, RECHECK_PER_FRAME do
        local id = table.remove(recheck)
        if not id then break end
        Warm(id)
    end
    if #recheck == 0 then
        driver:SetScript("OnUpdate", nil)
        C_Timer.After(RECHECK_DELAY, StartRead)
    end
end

StartRecheck = function()
    pass = pass + 1
    changed = 0
    wipe(recheck)
    for _, id in ipairs(IDS) do recheck[#recheck + 1] = id end
    driver:SetScript("OnUpdate", WarmStep)
end

-- The loading pass is over: give late spell text a moment, then re-read.
local function Finish()
    driver:SetScript("OnUpdate", nil)
    pass = 0
    Say(string.format("%d items loaded; re-reading them for text that loads late...", Count()))
    C_Timer.After(RECHECK_DELAY, StartRecheck)
end

local function Request(id)
    if Item and Item.CreateFromItemID then
        local item = Item:CreateFromItemID(id)
        if item:IsItemEmpty() then DB().missing[id] = true; return end
        pending = pending + 1
        item:ContinueOnItemLoad(function()
            pending = pending - 1
            Store(id)
        end)
    else
        if C_Item and C_Item.RequestLoadItemDataByID then pcall(C_Item.RequestLoadItemDataByID, id) end
        Store(id) -- read now; anything not cached yet is retried on the next /djdump
    end
end

local function Step()
    for _ = 1, PER_FRAME do
        local id = table.remove(queue)
        if not id then break end
        Request(id)
    end
    local now = GetTime()
    if #queue == 0 and (pending <= 0 or now - lastProgress > GIVE_UP_AFTER) then
        Finish()
    elseif now - startedAt > 5 and math.floor(now) % 10 == 0 and math.floor(now) ~= DB().lastNote then
        DB().lastNote = math.floor(now)
        Say(string.format("%d of %d saved...", Count(), #IDS))
    end
end

local function Start()
    if running then Say("already running.") return end
    if #IDS == 0 then Say("ItemIDs.lua is empty: run scripts/item-dump/make-ids.py first.") return end
    wipe(queue)
    for _, id in ipairs(IDS) do
        if not DB().items[id] then queue[#queue + 1] = id end
    end
    if #queue == 0 then Say("every item is already saved. /djdump refresh reads them all again.") return end
    running, pending = true, 0
    startedAt, lastProgress = GetTime(), GetTime()
    Say(string.format("reading %d items (%d already saved). Stay logged in until it says done.", #queue, Count()))
    driver:SetScript("OnUpdate", Step)
end

SLASH_DJITEMDUMP1 = "/djdump"
SlashCmdList.DJITEMDUMP = function(msg)
    msg = (msg or ""):lower():match("^%s*(.-)%s*$")
    if msg == "status" then
        Say(string.format("%d of %d items saved%s.", Count(), #IDS, running and ", still running" or ""))
    elseif msg == "reset" then
        DJItemDumpDB = nil
        Say("cleared. /djdump to start again.")
    elseif msg == "talents" or msg == "talents reset" then
        DJItemDump_StartTalents(msg == "talents reset")
    elseif msg == "refresh" then
        if running then Say("already running.") return end
        if Count() == 0 then Say("nothing saved yet: /djdump first.") return end
        running = true
        pass = 0
        Say(string.format("re-reading %d saved tooltips...", Count()))
        StartRecheck()
    else
        Start()
    end
end
