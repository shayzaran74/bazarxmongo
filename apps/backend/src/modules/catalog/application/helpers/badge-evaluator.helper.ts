import { BadgeRule } from '@barterborsa/shared-persistence/schemas/backend/badgeRule.schema';

interface BadgeCondition {
  AND?: BadgeCondition[];
  OR?: BadgeCondition[];
  field?: string;
  operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains';
  value?: unknown;
}

interface BadgeDisplay {
  text: string;
  style: {
    backgroundColor: string;
    color: string;
  };
}

interface DynamicBadges {
  topLeft: BadgeDisplay | null;
  topRight: BadgeDisplay | null;
  bottomLeft: BadgeDisplay | null;
  bottomRight: BadgeDisplay | null;
}

export async function populateDynamicBadges(items: Record<string, unknown>[]) {
  if (!items || items.length === 0) return items;

  try {
    // 1. Fetch all active badge rules sorted by priority ascending
    const activeRules = await BadgeRule.find({ isActive: true }).sort({ priority: 1 }).lean().exec();

    if (!activeRules || activeRules.length === 0) {
      for (const item of items) {
        item.dynamicBadges = {
          topLeft: null,
          topRight: null,
          bottomLeft: null,
          bottomRight: null,
        };
      }
      return items;
    }

    const positionMap: Record<string, string> = {
      'TOP_LEFT': 'topLeft',
      'TOP_RIGHT': 'topRight',
      'BOTTOM_LEFT': 'bottomLeft',
      'BOTTOM_RIGHT': 'bottomRight',
    };

    // 2. Evaluate rules for each item
    for (const item of items) {
      const badges: DynamicBadges = {
        topLeft: null,
        topRight: null,
        bottomLeft: null,
        bottomRight: null,
      };

      for (const rule of activeRules) {
        if (evaluateCondition(item, rule.conditionJson as BadgeCondition)) {
          const posKey = positionMap[rule.position];
          if (posKey) {
            const textVal = rule.displayText?.tr || rule.displayText?.en || rule.displayText || '';
            badges[posKey as keyof DynamicBadges] = {
              text: textVal,
              style: {
                backgroundColor: rule.backgroundColor || '#6366f1',
                color: rule.textColor || '#ffffff'
              }
            };
          }
        }
      }

      item.dynamicBadges = badges;
    }
  } catch (error) {
    console.error('❌ Error in populateDynamicBadges:', error);
    // Fallback: populate empty badges so that the query successfully returns without failing
    for (const item of items) {
      item.dynamicBadges = {
        topLeft: null,
        topRight: null,
        bottomLeft: null,
        bottomRight: null,
      };
    }
  }

  return items;
}

function evaluateCondition(listing: Record<string, unknown>, condition: BadgeCondition): boolean {
  if (!condition) return true;

  // Logical AND
  if (condition.AND && Array.isArray(condition.AND)) {
    return condition.AND.every((cond: BadgeCondition) => evaluateCondition(listing, cond));
  }
  // Logical OR
  if (condition.OR && Array.isArray(condition.OR)) {
    return condition.OR.some((cond: BadgeCondition) => evaluateCondition(listing, cond));
  }

  const { field, operator, value } = condition;
  if (!field) return true;

  // Resolve field value on listing
  let listingValue = listing[field];
  
  // If undefined, try under catalogProduct
  if (listingValue === undefined && listing.catalogProduct && typeof listing.catalogProduct === 'object') {
    listingValue = (listing.catalogProduct as Record<string, unknown>)[field];
  }

  let val = value;
  let lVal = listingValue;

  // If the listing value is undefined/null, handle defaults or falsy comparisons
  if (lVal === undefined || lVal === null) {
    if (typeof val === 'number') {
      lVal = 0;
    } else if (typeof val === 'string') {
      lVal = '';
    } else if (Array.isArray(val)) {
      lVal = '';
    }
  }

  // Handle number conversion
  if (typeof val === 'number') {
    lVal = Number(lVal);
  }

  switch (operator) {
    case 'eq':
      return lVal === val;
    case 'ne':
      return lVal !== val;
    case 'gt':
      return (lVal as number) > (val as number);
    case 'gte':
      return (lVal as number) >= (val as number);
    case 'lt':
      return (lVal as number) < (val as number);
    case 'lte':
      return (lVal as number) <= (val as number);
    case 'in':
      return Array.isArray(val) ? val.includes(lVal) : [val].includes(lVal);
    case 'nin':
      return !(Array.isArray(val) ? val.includes(lVal) : [val].includes(lVal));
    case 'contains':
      return typeof lVal === 'string' && lVal.toLowerCase().includes(String(val).toLowerCase());
    default:
      return lVal === val;
  }
}
