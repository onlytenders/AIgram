import type { IStore, IEntity } from '../types/interfaces';

export abstract class BaseStore<T extends IEntity> implements IStore<T> {
  protected items: Map<string, T> = new Map();

  public getAll(): T[] {
    return Array.from(this.items.values());
  }

  public getById(id: string): T | undefined {
    return this.items.get(id);
  }

  public create(data: Partial<T>): T {
    const entity = this.buildEntity(data);
    this.items.set(entity.id, entity);
    this.onEntityCreated(entity);
    return entity;
  }

  public update(id: string, data: Partial<T>): T | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;

    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date()
    } as T;

    this.items.set(id, updated);
    this.onEntityUpdated(updated);
    return updated;
  }

  public delete(id: string): boolean {
    const entity = this.items.get(id);
    if (!entity) return false;

    this.items.delete(id);
    this.onEntityDeleted(entity);
    return true;
  }

  // Template method pattern - subclasses must implement
  protected abstract buildEntity(data: Partial<T>): T;

  // Hook methods for event handling (optional overrides)
  protected onEntityCreated(entity: T): void {
    // Override in subclasses if needed
  }

  protected onEntityUpdated(entity: T): void {
    // Override in subclasses if needed
  }

  protected onEntityDeleted(entity: T): void {
    // Override in subclasses if needed
  }

  // Utility methods
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  protected getCurrentTimestamp(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
} 