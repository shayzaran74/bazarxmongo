// apps/backend/src/modules/content/domain/entities/help-article.entity.ts

import { AggregateRoot, Result, DomainException } from '@barterborsa/shared-core';
import { ArticleStatus } from '../enums/article-status.enum';

export interface HelpArticleProps {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: ArticleStatus;
  upvotes: number;
  downvotes: number;
  order: number;
  language: string;
  categoryId?: string;
  isActive: boolean;
  isPopular: boolean;
  platform: string;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class HelpArticle extends AggregateRoot<HelpArticleProps> {
  private constructor(props: HelpArticleProps, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<HelpArticleProps, 'createdAt' | 'updatedAt' | 'viewCount' | 'upvotes' | 'downvotes'>, id?: string): HelpArticle {
    return new HelpArticle({
      ...props,
      upvotes: 0,
      downvotes: 0,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, id);
  }

  public publish(): void {
    this.props.status = ArticleStatus.PUBLISHED;
    this.props.updatedAt = new Date();
  }

  public archive(): void {
    this.props.status = ArticleStatus.ARCHIVED;
    this.props.updatedAt = new Date();
  }

  public incrementViewCount(): void {
    this.props.viewCount++;
  }

  public vote(type: 'up' | 'down'): void {
    if (type === 'up') {
      this.props.upvotes++;
    } else {
      this.props.downvotes++;
    }
  }
}
