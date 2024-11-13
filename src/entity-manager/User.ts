// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityManager } from '@karmaniverous/entity-manager'; // imported to support API docs
import type { Entity } from '@karmaniverous/entity-tools';

/**
 * User entity interface.
 *
 * This is the application-facing interface for the User entity. Because it extends the {@link Entity | `Entity`} interface, it supports additional properties of any type supported by the database.
 *
 * Run the {@link EntityManager | `EntityManager`} `addKeys` method to add generated properties to any {@link Entity | `Entity`} object before sending it to the database.
 *
 * @category User
 */
export interface User extends Entity {
  beneficiaryId: string;
  created: number;
  firstName: string;
  firstNameCanonical: string;
  lastName: string;
  lastNameCanonical: string;
  phone?: string;
  updated: number;
  userId: string;
}
