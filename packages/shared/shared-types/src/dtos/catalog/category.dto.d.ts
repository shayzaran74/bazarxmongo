export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    children?: Category[];
    isActive?: boolean;
    image?: string;
    icon?: string;
    colorFrom?: string;
    colorTo?: string;
}
