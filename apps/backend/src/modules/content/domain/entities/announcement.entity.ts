// apps/backend/src/modules/content/domain/entities/announcement.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';

export interface AnnouncementProps {
  title: string;
  content: string;
  type: string;
  priority: number;
  startDate: Date;
  endDate?: Date;
  imageUrl?: string;
  isActive: boolean;
  linkText?: string;
  linkUrl?: string;
  targetPage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Announcement extends AggregateRoot<AnnouncementProps> {
  private constructor(props: AnnouncementProps, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<AnnouncementProps, 'createdAt' | 'updatedAt'>, id?: string): Announcement {
    return new Announcement({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, id);
  }

  public isVisible(): boolean {
    if (!this.props.isActive) return false;
    const now = new Date();
    if (this.props.startDate > now) return false;
    if (this.props.endDate && this.props.endDate < now) return false;
    return true;
  }
}
