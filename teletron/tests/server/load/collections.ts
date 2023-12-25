// eslint-disable-next-line import/no-extraneous-dependencies
import { type Collection, SuperSave } from 'supersave';
import { collections } from '../extension/data';

let superSave: SuperSave;

void SuperSave.create('sqlite://db.sqlite').then((ss) => {
  superSave = ss;
});

export function getSuperSave() {
  if (!superSave) {
    throw new Error('SuperSave not initialized yet');
  }
  return superSave;
}

export async function addCollection<T = unknown>(extensionName: string, collection: Collection) {
  collections.push(collection);
  return superSave.addCollection<T>({ ...collection, namespace: extensionName });
}
export async function addEntity<T = unknown>(extensionName: string, collection: Collection) {
  return superSave.addEntity<T>({ ...collection, namespace: extensionName });
}

export async function loadCollections(extensionName: string, collections: Collection[]) {
  for (const collection of collections) {
    await addCollection(extensionName, collection);
  }
}
