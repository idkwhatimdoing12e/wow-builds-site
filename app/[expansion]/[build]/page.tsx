import Link from "next/link";
import buildsData from "../../data/builds.json";

type GearItem = {
  slot: string;
  itemName: string;
  itemId?: number;
  iconName?: string;
  enchant?: string;
};

type Build = {
  id: string;
  name: string;
  description?: string;
  gear: GearItem[];
};

type Expansion = {
  id: string;
  name: string;
  builds: Build[];
};

function wowheadItemUrl(itemId?: number) {
  return itemId ? `https://www.wowhead.com/tbc/item=${itemId}` : undefined;
}

function wowIconUrl(iconName?: string) {
  return iconName ? `https://wow.zamimg.com/images/wow/icons/large/${iconName}.jpg` : undefined;
}

export default async function BuildPage({
  params,
}: {
  params: Promise<{ expansion: string; build: string }>;
}) {
  const { expansion, build: buildId } = await params;

  const expansions = (buildsData as { expansions: Expansion[] }).expansions;

  const expParam = decodeURIComponent(expansion ?? "").trim().toLowerCase();
  const buildParam = decodeURIComponent(buildId ?? "").trim().toLowerCase();

  const exp = expansions.find((e) => e.id.trim().toLowerCase() === expParam);
  const build = exp?.builds.find((b) => b.id.trim().toLowerCase() === buildParam);

  if (!exp || !build) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <Link href="/" className="text-white/60 hover:text-white">
            ← Home
          </Link>
          <h1 className="mt-6 text-3xl font-semibold">Not found</h1>
          <p className="mt-2 text-white/60">That build page doesn’t exist.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href={`/${encodeURIComponent(exp.id)}`} className="text-white/60 hover:text-white">
          ← {exp.name}
        </Link>

        <h1 className="mt-6 text-5xl font-semibold tracking-tight">{build.name}</h1>
        {build.description ? <p className="mt-3 text-lg text-white/60">{build.description}</p> : null}

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Gear</h2>

          <div className="mt-4 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {build.gear.map((g) => {
              const url = wowheadItemUrl(g.itemId);
              const icon = wowIconUrl(g.iconName);

              return (
                <div key={`${g.slot}-${g.itemName}`} className="px-5 py-4 flex items-center gap-4">
                  {url ? (
                    <a href={url} target="_blank" rel="noreferrer" className="shrink-0" title="Open on Wowhead">
                      {icon ? (
                        <img src={icon} alt={g.itemName} className="h-10 w-10 rounded-md" loading="lazy" />
                      ) : (
                        <div className="h-10 w-10 rounded-md border border-white/20 flex items-center justify-center text-white/50">
                          ?
                        </div>
                      )}
                    </a>
                  ) : (
                    <div className="h-10 w-10 rounded-md border border-white/20 flex items-center justify-center text-white/50 shrink-0">
                      ?
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/50">{g.slot}</div>
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-lg font-medium hover:underline truncate block"
                      >
                        {g.itemName}
                      </a>
                    ) : (
                      <div className="text-lg font-medium truncate">{g.itemName}</div>
                    )}
                    {g.enchant ? <div className="mt-1 text-sm text-white/60">Enchant: {g.enchant}</div> : null}
                  </div>

                  {url ? (
                    <a href={url} target="_blank" rel="noreferrer" className="text-white/50">
                      ↗
                    </a>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
