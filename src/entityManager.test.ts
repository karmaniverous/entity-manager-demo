import { EntityManager } from '@karmaniverous/entity-manager';
import { expect } from 'chai';

import { entityManager } from './entityManager';

describe('entityManager', function () {
  it('parses config without error', function () {
    expect(entityManager).to.be.an.instanceOf(EntityManager);
  });
});
