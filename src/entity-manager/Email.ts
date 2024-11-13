// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityManager } from '@karmaniverous/entity-manager'; // imported to support API docs
import { Entity } from '@karmaniverous/entity-tools';

/**
 * Email entity interface.
 *
 * This is the application-facing interface for the Email entity. Because it extends the {@link Entity | `Entity`} interface, it supports additional properties of any type supported by the database.
 *
 * Run the {@link EntityManager | `EntityManager`} `addKeys` method to add generated properties to any {@link Entity | `Entity`} object before sending it to the database.
 *
 * @category Email
 */
export interface Email extends Entity {
  created: number;
  email: string;
  userId: string;
}
