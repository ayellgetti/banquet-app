import { useMemo, useState, type CSSProperties } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MENU_ITEMS,
  type MenuCategory,
  type MenuItem,
} from "@/data/enquiryOptions";
import { VISITING_CARD_BUSINESS_NAME } from "@/data/visitingCard";
import { BanquetHeader } from "@/components/visiting-card/BanquetHeader";
import {
  BORDER_GOLD,
  BOX_BORDER,
  BROWN,
  CARD_FONT,
  CREAM,
  GOLD,
  GOLD_LIGHT,
} from "@/components/visiting-card/cardTheme";
import { downloadPdfFromElement } from "@/lib/downloadPdf";
import { useT } from "@/i18n";
import { useMenuLabels } from "@/i18n/menuLabels";
import { toast } from "sonner";


/** Catalog display order — custom sequence for print layout. */
const MENU_CATALOG_CATEGORY_ORDER: MenuCategory[] = [
  "Welcome Drink",
  "Starters",
  "Main Course",
  "Kathiawadi",
  "Rajasthani",
  "Farsan",
  "Indian Breads",
  "Rice",
  "Dal",
  "Raita",
  "Salads",
  "Sweets & Ice Cream",
  "Live Counters",
  "Breakfast",
];

/** Page 2 begins here — Indian Breads, Rice, Dal and all categories after. */
const PAGE_2_START_CATEGORY: MenuCategory = "Indian Breads";

const LIVE_COUNTERS_SUBCATEGORY_ORDER = [
  "Chaat Counter",
  "Chinese / Oriental Counter",
  "South Indian Counter",
  "Pizza",
  "Pasta Counter",
  "Additional Counters",
];

const LIVE_COUNTER_CHAAT_SUB = "Chaat Counter";
const LIVE_COUNTER_CHINESE_SUB = "Chinese / Oriental Counter";
const LIVE_COUNTER_SOUTH_INDIAN_SUB = "South Indian Counter";

const MAIN_COURSE_SUBCATEGORY_ORDER = [
  "Veg Main Course",
  "Paneer Main Course",
  "Kathiawadi",
  "Rajasthani",
];

const MAIN_COURSE_HORIZONTAL_SUB = "Veg Main Course";
const MAIN_COURSE_PANEER_SUB = "Paneer Main Course";
const MAIN_COURSE_KATHIAWADI_SUB = "Kathiawadi";
const MAIN_COURSE_RAJASTHANI_SUB = "Rajasthani";

const SWEETS_HORIZONTAL_SUB = "Sweets";

const SWEETS_ICE_CREAM_REGULAR_SUB = "Ice Cream — Regular";
const SWEETS_ICE_CREAM_SPECIAL_SUB = "Ice Cream — Special (+₹25 Extra)";

const SWEETS_SUBCATEGORY_ORDER = [
  "Sweets",
  "Ice Cream — Regular",
  "Ice Cream — Special (+₹25 Extra)",
];

const WELCOME_DRINK_BASIC_SUB = "Basic";
const WELCOME_DRINK_FRESH_FRUIT_SUB = "Fresh Fruit Juice";

const WELCOME_DRINK_SUBCATEGORY_ORDER = [
  "Basic",
  "Fresh Fruit Juice",
  "Mocktails (+₹20 Extra)",
];

const STARTERS_VEG_SUB = "Veg Starter";
const STARTERS_PANEER_SUB = "Paneer Starter";

const STARTERS_SUBCATEGORY_ORDER = [STARTERS_VEG_SUB, STARTERS_PANEER_SUB];

/** Categories rendered in one horizontal row (left to right). */
const SIDE_BY_SIDE_PAIRS: MenuCategory[][] = [["Raita", "Salads"]];

/** Indian Breads + Rice + Dal in one row on page 2. */
const BREADS_RICE_DAL_TRIPLE: MenuCategory[] = ["Indian Breads", "Rice", "Dal"];

type CatalogRow =
  | { type: "single"; category: MenuCategory }
  | { type: "pair"; categories: MenuCategory[] }
  | { type: "breads-stack"; triple: MenuCategory[] };

const SUBCARD_MIN_WIDTH_PX = 72;

function subcardFlexStyle(itemCount: number): CSSProperties {
  const minWidth = Math.max(SUBCARD_MIN_WIDTH_PX, 48 + itemCount * 6);
  return { flex: `${itemCount} 1 ${minWidth}px` };
}

function breadsTripleFlexStyle(category: MenuCategory): CSSProperties {
  if (category === "Indian Breads") {
    return { flex: "5 1 96px" };
  }
  if (category === "Rice") {
    return { flex: "3.8 1 84px" };
  }
  if (category === "Dal") {
    return { flex: "7 1 84px" };
  }

  return { flex: "1 1 84px" };
}

function mainCourseVerticalFlexStyle(sub: string, itemCount: number): CSSProperties {
  let weight = itemCount;
  let minExtra = 0;

  if (sub === MAIN_COURSE_PANEER_SUB) {
    weight = itemCount * 1.05;
    minExtra = 0;
  } else if (sub === MAIN_COURSE_KATHIAWADI_SUB) {
    weight = itemCount * 1.22;
    minExtra = 8;
  } else if (sub === MAIN_COURSE_RAJASTHANI_SUB) {
    weight = itemCount * 1.18;
    minExtra = 10;
  }

  const minWidth = Math.max(SUBCARD_MIN_WIDTH_PX, 48 + itemCount * 6 + minExtra);
  return { flex: `${weight} 1 ${minWidth}px` };
}

function startersPairFlexStyle(sub: string, itemCount: number): CSSProperties {
  let weight = itemCount;
  let minExtra = 0;

  if (sub === STARTERS_VEG_SUB) {
    weight = itemCount * 0.86;
    minExtra = -4;
  } else if (sub === STARTERS_PANEER_SUB) {
    weight = itemCount * 1.35;
    minExtra = 18;
  }

  const minWidth = Math.max(SUBCARD_MIN_WIDTH_PX, 48 + itemCount * 6 + minExtra);
  return { flex: `${weight} 1 ${minWidth}px` };
}

function liveCounterTopRowFlexStyle(sub: string, itemCount: number): CSSProperties {
  let weight = itemCount;
  let minExtra = 0;

  if (sub === LIVE_COUNTER_CHAAT_SUB) {
    weight = itemCount * 0.74;
    minExtra = -12;
  } else if (sub === LIVE_COUNTER_CHINESE_SUB) {
    weight = itemCount * 1.55;
    minExtra = 28;
  } else if (sub === LIVE_COUNTER_SOUTH_INDIAN_SUB) {
    weight = itemCount * 0.68;
    minExtra = -10;
  }

  const minWidth = Math.max(SUBCARD_MIN_WIDTH_PX, 48 + itemCount * 6 + minExtra);
  return { flex: `${weight} 1 ${minWidth}px` };
}

function sweetsIceCreamFlexStyle(sub: string, itemCount: number): CSSProperties {
  let weight = itemCount;
  let minExtra = 0;

  if (sub === SWEETS_ICE_CREAM_REGULAR_SUB) {
    return { flex: "10.46 1 84px" };
  } else if (sub === SWEETS_ICE_CREAM_SPECIAL_SUB) {
    weight = itemCount * 1.28;
    minExtra = 12;
  }

  const minWidth = Math.max(SUBCARD_MIN_WIDTH_PX, 48 + itemCount * 6 + minExtra);
  return { flex: `${weight} 1 ${minWidth}px` };
}

function groupItemsByCategory(items: MenuItem[]): Map<MenuCategory, MenuItem[]> {
  const map = new Map<MenuCategory, MenuItem[]>();
  for (const item of items) {
    const category = item.category as MenuCategory;
    const list = map.get(category);
    if (list) list.push(item);
    else map.set(category, [item]);
  }
  return map;
}

function splitCategoriesForPages(
  categories: MenuCategory[],
  byCategory: Map<MenuCategory, MenuItem[]>,
): MenuCategory[][] {
  const nonEmpty = categories.filter((cat) => (byCategory.get(cat)?.length ?? 0) > 0);
  const page2Start = nonEmpty.indexOf(PAGE_2_START_CATEGORY);

  if (page2Start <= 0) {
    return page2Start === 0 ? [[], nonEmpty] : [nonEmpty, []];
  }

  return [nonEmpty.slice(0, page2Start), nonEmpty.slice(page2Start)];
}

function groupBySubcategory(items: MenuItem[]): { sub: string; items: MenuItem[] }[] {
  const groups = new Map<string, MenuItem[]>();
  for (const item of items) {
    const key = item.subcategory ?? "";
    const list = groups.get(key);
    if (list) list.push(item);
    else groups.set(key, [item]);
  }
  return [...groups.entries()].map(([sub, groupItems]) => ({ sub, items: groupItems }));
}

function sortSubGroups(
  category: MenuCategory,
  groups: { sub: string; items: MenuItem[] }[],
): { sub: string; items: MenuItem[] }[] {
  const order =
    category === "Live Counters"
      ? LIVE_COUNTERS_SUBCATEGORY_ORDER
      : category === "Main Course"
        ? MAIN_COURSE_SUBCATEGORY_ORDER
        : category === "Sweets & Ice Cream"
          ? SWEETS_SUBCATEGORY_ORDER
          : category === "Welcome Drink"
            ? WELCOME_DRINK_SUBCATEGORY_ORDER
            : category === "Starters"
              ? STARTERS_SUBCATEGORY_ORDER
              : null;

  if (!order) return groups;

  const rank = new Map(order.map((sub, index) => [sub, index]));
  return [...groups].sort(
    (a, b) => (rank.get(a.sub) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.sub) ?? Number.MAX_SAFE_INTEGER),
  );
}

function buildCatalogRows(categories: MenuCategory[]): CatalogRow[] {
  const pairByStart = new Map(SIDE_BY_SIDE_PAIRS.map(([first, second]) => [first, second]));
  const pairedSecond = new Set(SIDE_BY_SIDE_PAIRS.map(([, second]) => second));
  const stackSkip = new Set<MenuCategory>(BREADS_RICE_DAL_TRIPLE.slice(1));
  const rows: CatalogRow[] = [];

  for (const category of categories) {
    if (pairedSecond.has(category) || stackSkip.has(category)) continue;

    if (category === BREADS_RICE_DAL_TRIPLE[0]) {
      rows.push({
        type: "breads-stack",
        triple: BREADS_RICE_DAL_TRIPLE,
      });
      continue;
    }

    const partner = pairByStart.get(category);
    if (partner) {
      rows.push({ type: "pair", categories: [category, partner] });
      continue;
    }

    rows.push({ type: "single", category });
  }

  return rows;
}

const MenuItemChip = ({ item }: { item: MenuItem }) => {
  const menuLabels = useMenuLabels();

  return (
    <li
      className="menu-catalog-item inline-flex max-w-full items-center rounded-md px-2 py-1 text-[10px] leading-snug sm:text-[11px]"
      data-menu-catalog-item
      data-menu-catalog-box
      data-menu-package-box
      style={{ border: BOX_BORDER, backgroundColor: "#ffffff", color: BROWN }}
    >
      <span className="whitespace-normal break-words">{menuLabels.itemName(item)}</span>
    </li>
  );
};

const MenuItemFlow = ({ items }: { items: MenuItem[] }) => (
  <ul className="menu-catalog-items flex min-w-0 flex-wrap gap-1.5">
    {items.map((item) => (
      <MenuItemChip key={item.id} item={item} />
    ))}
  </ul>
);

const CompactHorizontalSubcategoryRow = ({ sub, items }: { sub: string; items: MenuItem[] }) => {
  const menuLabels = useMenuLabels();

  return (
    <div
      className="menu-catalog-subcategory-horizontal flex flex-row items-stretch overflow-hidden rounded-lg"
      data-menu-catalog-subcategory-horizontal
      data-welcome-drink-basic={sub === WELCOME_DRINK_BASIC_SUB || undefined}
      data-welcome-drink-fresh-fruit={sub === WELCOME_DRINK_FRESH_FRUIT_SUB || undefined}
      style={{ border: BOX_BORDER, backgroundColor: "#ffffff" }}
    >
      <div
        className="menu-catalog-horizontal-header flex shrink-0 items-center border-r px-2 py-1.5 sm:px-3 sm:py-2"
        style={{ borderColor: GOLD_LIGHT, backgroundColor: "#fffef8" }}
      >
        <p
          className="w-[4.5rem] text-[10px] font-bold uppercase leading-tight tracking-[0.06em] sm:w-[5rem] sm:text-[11px]"
          style={{ color: GOLD }}
        >
          {menuLabels.subcategoryName(sub)}
        </p>
      </div>
      <div className="flex min-w-0 flex-1 items-start p-1.5 sm:p-2">
        <MenuItemFlow items={items} />
      </div>
    </div>
  );
};

const SubcategoryCard = ({
  sub,
  items,
  equalColumns = false,
  fullWidth = false,
  flexStyle,
}: {
  sub: string;
  items: MenuItem[];
  equalColumns?: boolean;
  fullWidth?: boolean;
  flexStyle?: CSSProperties;
}) => {
  const menuLabels = useMenuLabels();

  return (
    <article
      className={`menu-catalog-subcard flex min-w-0 flex-col overflow-hidden rounded-lg${fullWidth ? " w-full" : ""}`}
      data-menu-catalog-subcard
      data-menu-catalog-box
      data-menu-package-box
      data-menu-catalog-full-width={fullWidth || undefined}
      data-menu-catalog-paneer={sub === MAIN_COURSE_PANEER_SUB || undefined}
      data-menu-catalog-kathiawadi={sub === MAIN_COURSE_KATHIAWADI_SUB || undefined}
      data-menu-catalog-rajasthani={sub === MAIN_COURSE_RAJASTHANI_SUB || undefined}
      data-starters-veg={sub === STARTERS_VEG_SUB || undefined}
      data-starters-paneer={sub === STARTERS_PANEER_SUB || undefined}
      data-live-counter-chaat={sub === LIVE_COUNTER_CHAAT_SUB || undefined}
      data-live-counter-chinese={sub === LIVE_COUNTER_CHINESE_SUB || undefined}
      data-live-counter-south-indian={sub === LIVE_COUNTER_SOUTH_INDIAN_SUB || undefined}
      data-sweets-ice-regular={sub === SWEETS_ICE_CREAM_REGULAR_SUB || undefined}
      data-sweets-ice-special={sub === SWEETS_ICE_CREAM_SPECIAL_SUB || undefined}
      style={{
        border: BOX_BORDER,
        backgroundColor: "#ffffff",
        ...(flexStyle ?? (fullWidth || equalColumns ? undefined : subcardFlexStyle(items.length))),
      }}
    >
      {sub ? (
        <div
          className="border-b px-2 py-1.5 text-center sm:py-2"
          style={{ borderColor: GOLD_LIGHT, backgroundColor: "#fffef8" }}
        >
          <p
            className="text-[10px] font-bold uppercase leading-tight tracking-[0.08em] sm:text-[11px]"
            style={{ color: GOLD }}
          >
            {menuLabels.subcategoryName(sub)}
          </p>
        </div>
      ) : null}
      <div className="flex-1 p-1.5 sm:p-2">
        <MenuItemFlow items={items} />
      </div>
    </article>
  );
};

const SubcategoryCards = ({
  subGroups,
  category,
}: {
  subGroups: { sub: string; items: MenuItem[] }[];
  category: MenuCategory;
}) => {
  if (category === "Welcome Drink") {
    return (
      <div className="menu-catalog-welcome-drink space-y-1.5">
        {subGroups.map(({ sub, items }) => (
          <CompactHorizontalSubcategoryRow key={sub || "__default"} sub={sub} items={items} />
        ))}
      </div>
    );
  }

  if (category === "Starters") {
    return (
      <div className="menu-catalog-starters flex items-stretch gap-2">
        {subGroups.map(({ sub, items }) => (
          <SubcategoryCard
            key={sub || "__default"}
            sub={sub}
            items={items}
            flexStyle={startersPairFlexStyle(sub, items.length)}
          />
        ))}
      </div>
    );
  }

  if (category === "Main Course") {
    const horizontalGroup = subGroups.find((group) => group.sub === MAIN_COURSE_HORIZONTAL_SUB);
    const verticalGroups = subGroups.filter((group) => group.sub !== MAIN_COURSE_HORIZONTAL_SUB);

    return (
      <div className="menu-catalog-main-course space-y-2">
        {horizontalGroup ? (
          <SubcategoryCard sub={horizontalGroup.sub} items={horizontalGroup.items} fullWidth />
        ) : null}
        {verticalGroups.length > 0 ? (
          <div className="menu-catalog-subcards menu-catalog-main-course-vertical flex items-stretch gap-2">
            {verticalGroups.map(({ sub, items }) => (
              <SubcategoryCard
                key={sub || "__default"}
                sub={sub}
                items={items}
                flexStyle={mainCourseVerticalFlexStyle(sub, items.length)}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (category === "Sweets & Ice Cream") {
    const horizontalGroup = subGroups.find((group) => group.sub === SWEETS_HORIZONTAL_SUB);
    const iceCreamGroups = subGroups.filter((group) => group.sub !== SWEETS_HORIZONTAL_SUB);

    return (
      <div className="menu-catalog-sweets space-y-2">
        {horizontalGroup ? (
          <SubcategoryCard sub={horizontalGroup.sub} items={horizontalGroup.items} fullWidth />
        ) : null}
        {iceCreamGroups.length > 0 ? (
          <div className="menu-catalog-sweets-ice flex items-stretch gap-2">
            {iceCreamGroups.map(({ sub, items }) => (
              <SubcategoryCard
                key={sub || "__default"}
                sub={sub}
                items={items}
                flexStyle={sweetsIceCreamFlexStyle(sub, items.length)}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (category === "Live Counters") {
    const topRowSubs = new Set([
      LIVE_COUNTER_CHAAT_SUB,
      LIVE_COUNTER_CHINESE_SUB,
      LIVE_COUNTER_SOUTH_INDIAN_SUB,
    ]);
    const topRowGroups = subGroups.filter((group) => topRowSubs.has(group.sub));
    const bottomRowGroups = subGroups.filter((group) => !topRowSubs.has(group.sub));

    return (
      <div className="menu-catalog-live-counters space-y-2">
        {topRowGroups.length > 0 ? (
          <div className="menu-catalog-live-counters-top flex items-stretch gap-2">
            {topRowGroups.map(({ sub, items }) => (
              <SubcategoryCard
                key={sub || "__default"}
                sub={sub}
                items={items}
                flexStyle={liveCounterTopRowFlexStyle(sub, items.length)}
              />
            ))}
          </div>
        ) : null}
        {bottomRowGroups.length > 0 ? (
          <div className="menu-catalog-live-counters-bottom menu-catalog-subcards-grid grid grid-cols-3 items-stretch gap-2">
            {bottomRowGroups.map(({ sub, items }) => (
              <SubcategoryCard key={sub || "__default"} sub={sub} items={items} equalColumns />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="menu-catalog-subcards flex flex-wrap items-stretch gap-2">
      {subGroups.map(({ sub, items }) => (
        <SubcategoryCard key={sub || "__default"} sub={sub} items={items} />
      ))}
    </div>
  );
};

const CategoryBody = ({
  category,
  subGroups,
  hasSub,
  items,
}: {
  category: MenuCategory;
  subGroups: { sub: string; items: MenuItem[] }[];
  hasSub: boolean;
  items: MenuItem[];
}) => (
  <div className="flex-1">
    {hasSub ? (
      <SubcategoryCards subGroups={subGroups} category={category} />
    ) : (
      <MenuItemFlow items={items} />
    )}
  </div>
);

const CategorySection = ({
  category,
  items,
  compactHorizontal = false,
}: {
  category: MenuCategory;
  items: MenuItem[];
  compactHorizontal?: boolean;
}) => {
  const menuLabels = useMenuLabels();
  const subGroups = useMemo(
    () => sortSubGroups(category, groupBySubcategory(items)),
    [category, items],
  );
  const hasSub = subGroups.some((group) => group.sub);

  if (compactHorizontal) {
    return (
      <section
        className="menu-package-section menu-catalog-category menu-catalog-category-horizontal flex flex-row items-stretch overflow-hidden rounded-lg shadow-soft"
        data-menu-catalog-category
        data-menu-catalog-horizontal
        data-menu-catalog-welcome-drink={category === "Welcome Drink" || undefined}
        style={{ border: BORDER_GOLD, backgroundColor: CREAM, fontFamily: CARD_FONT }}
      >
        <div
          className="menu-catalog-horizontal-header flex shrink-0 items-center rounded-tl-lg border-r px-3 py-1.5 sm:px-4 sm:py-2"
          style={{ borderColor: GOLD_LIGHT, backgroundColor: "#ffffff" }}
        >
          <h2
            className="w-[4.5rem] text-[10px] font-bold uppercase leading-tight tracking-[0.06em] sm:w-[5rem] sm:text-[11px]"
            style={{ color: GOLD }}
          >
            {menuLabels.categoryName(category)}
          </h2>
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start p-2 sm:p-3">
          <CategoryBody category={category} subGroups={subGroups} hasSub={hasSub} items={items} />
        </div>
      </section>
    );
  }

  return (
    <section
      className="menu-package-section menu-catalog-category flex h-full flex-col overflow-hidden rounded-lg shadow-soft"
      data-menu-catalog-category
      style={{ border: BORDER_GOLD, backgroundColor: CREAM, fontFamily: CARD_FONT }}
    >
      <div
        className="rounded-t-lg border-b px-3 py-1.5 text-center sm:px-4"
        style={{ borderColor: GOLD_LIGHT, backgroundColor: "#ffffff" }}
      >
        <h2 className="text-sm font-bold sm:text-base" style={{ color: GOLD }}>
          {menuLabels.categoryName(category)}
        </h2>
      </div>
      <div className="p-2 sm:p-3">
        <CategoryBody category={category} subGroups={subGroups} hasSub={hasSub} items={items} />
      </div>
    </section>
  );
};

const CatalogCategoryRow = ({
  row,
  byCategory,
}: {
  row: CatalogRow;
  byCategory: Map<MenuCategory, MenuItem[]>;
}) => {
  if (row.type === "breads-stack") {
    const tripleSections = row.triple
      .map((category) => {
        const items = byCategory.get(category);
        if (!items?.length) return null;
        return (
          <div
            key={category}
            className="min-w-0"
            data-menu-catalog-triple-column={category}
            style={breadsTripleFlexStyle(category)}
          >
            <CategorySection category={category} items={items} />
          </div>
        );
      })
      .filter(Boolean);

    if (tripleSections.length === 0) return null;

    return (
      <div className="menu-catalog-breads-stack">
        <div className="menu-catalog-triple flex items-stretch gap-2">{tripleSections}</div>
      </div>
    );
  }

  if (row.type === "pair") {
    const sections = row.categories
      .map((category) => {
        const items = byCategory.get(category);
        if (!items?.length) return null;
        return <CategorySection key={category} category={category} items={items} />;
      })
      .filter(Boolean);

    if (sections.length === 0) return null;
    if (sections.length === 1) return <>{sections}</>;

    return (
      <div className="menu-catalog-pair grid grid-cols-2 items-stretch gap-2">
        {sections}
      </div>
    );
  }

  const items = byCategory.get(row.category);
  if (!items?.length) return null;
  return (
    <CategorySection
      category={row.category}
      items={items}
      compactHorizontal={row.category === "Farsan" || row.category === "Welcome Drink"}
    />
  );
};

const CatalogPage = ({
  categories,
  byCategory,
  pageNumber,
}: {
  categories: MenuCategory[];
  byCategory: Map<MenuCategory, MenuItem[]>;
  pageNumber: number;
}) => (
  <div className="menu-catalog-page space-y-1.5" data-menu-catalog-page={pageNumber}>
    <BanquetHeader showContactActions compact />

    <div className="menu-catalog-categories space-y-1.5">
      {buildCatalogRows(categories).map((row) => (
        <CatalogCategoryRow
          key={
            row.type === "breads-stack"
              ? "breads-stack"
              : row.type === "pair"
                ? row.categories.join("-")
                : row.category
          }
          row={row}
          byCategory={byCategory}
        />
      ))}
    </div>
  </div>
);

export const MenuCatalog = () => {
  const { t } = useT();
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const byCategory = useMemo(() => groupItemsByCategory(MENU_ITEMS), []);
  const pages = useMemo(
    () => splitCategoriesForPages(MENU_CATALOG_CATEGORY_ORDER, byCategory),
    [byCategory],
  );

  const handleDownloadPdf = async () => {
    const element = document.getElementById("menu-catalog-print-area");
    if (!element) return;

    setIsPdfGenerating(true);
    const loadingToast = toast.loading(t("toast.pdfGenerating"));
    try {
      const result = await downloadPdfFromElement(
        element,
        `${VISITING_CARD_BUSINESS_NAME.replace(/\s+/g, "_")}_Menu_Catalog.pdf`,
        { margin: 4 },
      );
      toast.dismiss(loadingToast);
      if (result === "view") {
        toast.info(t("toast.pdfOpenedMobile"), { duration: 8000 });
      }
    } catch {
      toast.dismiss(loadingToast);
      toast.error(t("toast.pdfFailed"));
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div id="menu-catalog-print-area" className="mx-auto w-full max-w-[210mm]">
        {pages.map((categories, index) => (
          <CatalogPage
            key={index}
            categories={categories}
            byCategory={byCategory}
            pageNumber={index + 1}
          />
        ))}
      </div>

      <div className="no-print flex flex-wrap justify-center gap-3">
        <Button
          className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
          onClick={() => void handleDownloadPdf()}
          disabled={isPdfGenerating}
        >
          <Printer className="h-4 w-4" />
          {isPdfGenerating ? t("toast.pdfGenerating") : t("menuCatalog.downloadPdf")}
        </Button>
      </div>
    </div>
  );
};
