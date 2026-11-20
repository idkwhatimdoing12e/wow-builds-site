-- /djdump talents: saves every talent's text at every rank, as WoW Forever's
-- talent window shows it, for the website's talent window.
--
-- Forever's talents are traits (C_Traits): a talent has one spell, and its
-- numbers change with the rank. C_Traits.GetTraitDescription(entryID, rank)
-- gives the window's own text for any rank, of any class's tree.
-- TalentSpells.lua (written by scripts/item-dump/talents.py) lists each
-- talent's trait entry, spell and rank count; the texts, name and icon land
-- in DJItemDumpDB.traits[entryID] and, after a /reload, in
-- SavedVariables/DJItemDump.lua, which talents.py reads.
--
-- 1.5.0: traits (1.4.0 saved one text per spell, the classic way, which
-- Forever's talents do not follow).

local ENTRIES = DJItemDump_TALENT_ENTRIES or {}
local PER_FRAME = 20
local GIVE_UP_AFTER = 15
local RETRY_DELAY = 3
local MAX_PASSES = 4

local function Say(msg) print("|cffd8a83cDJ Item Dump:|r " .. msg) end

local function DB()
    DJItemDumpDB = DJItemDumpDB or {}
    DJItemDumpDB.traits = DJItemDumpDB.traits or {}
    return DJItemDumpDB.traits
end

local function Info(spellID)
    if C_Spell and C_Spell.GetSpellInfo then
        local info = C_Spell.GetSpellInfo(spellID)
        if info then return info.name, info.iconID end
    elseif GetSpellInfo then
        local name, _, icon = GetSpellInfo(spellID)
        return name, icon
    end
end

local function RankText(entryID, rank)
    if not (C_Traits and C_Traits.GetTraitDescription) then return nil end
    local ok, text = pcall(C_Traits.GetTraitDescription, entryID, rank)
    if ok and type(text) == "string" and text ~= "" then return text end
    return nil
end

-- Saved once every rank has its text.
local function Complete(row)
    local saved = DB()[row[1]]
    if not saved or not saved.d then return false end
    for rank = 1, row[3] do
        if not saved.d[rank] then return false end
    end
    return true
end

local function Store(row)
    local entryID, spellID, ranks = row[1], row[2], row[3]
    local saved = DB()[entryID] or { s = spellID, d = {} }
    local name, icon = Info(spellID)
    saved.n, saved.i = saved.n or name, saved.i or icon
    for rank = 1, ranks do
        saved.d[rank] = saved.d[rank] or RankText(entryID, rank)
    end
    DB()[entryID] = saved
end

local driver = CreateFrame("Frame")
local queue, pending, pass, running, lastProgress = {}, 0, 0, false, 0

local function CountDone()
    local n = 0
    for _, row in ipairs(ENTRIES) do
        if Complete(row) then n = n + 1 end
    end
    return n
end

local StartPass

local function Step()
    for _ = 1, PER_FRAME do
        local row = table.remove(queue)
        if not row then break end
        local spellID = row[2]
        if Spell and Spell.CreateFromSpellID and spellID and spellID > 0 then
            local spell = Spell:CreateFromSpellID(spellID)
            if spell:IsSpellEmpty() then
                Store(row)
            else
                pending = pending + 1
                spell:ContinueOnSpellLoad(function()
                    pending = pending - 1
                    Store(row)
                    lastProgress = GetTime()
                end)
            end
        else
            Store(row)
        end
    end
    if #queue == 0 and (pending <= 0 or GetTime() - lastProgress > GIVE_UP_AFTER) then
        driver:SetScript("OnUpdate", nil)
        local done = CountDone()
        if done < #ENTRIES and pass < MAX_PASSES then
            C_Timer.After(RETRY_DELAY, StartPass)
        else
            running = false
            Say(string.format("talents done: %d of %d talents saved with every rank. Type /reload to write them to disk.", done, #ENTRIES))
        end
    end
end

StartPass = function()
    pass = pass + 1
    wipe(queue)
    pending = 0
    for _, row in ipairs(ENTRIES) do
        if not Complete(row) then queue[#queue + 1] = row end
    end
    lastProgress = GetTime()
    driver:SetScript("OnUpdate", Step)
end

function DJItemDump_StartTalents(reset)
    if running then Say("already running.") return end
    if #ENTRIES == 0 then Say("TalentSpells.lua is empty: run scripts/item-dump/talents.py first.") return end
    if not (C_Traits and C_Traits.GetTraitDescription) then
        Say("this client has no C_Traits.GetTraitDescription; saving names and icons only.")
    end
    if reset then DJItemDumpDB = DJItemDumpDB or {}; DJItemDumpDB.traits = {} end
    running, pass = true, 0
    Say(string.format("reading %d talents at every rank...", #ENTRIES))
    StartPass()
end
