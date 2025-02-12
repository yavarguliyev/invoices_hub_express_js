import { Repository, EntityTarget, In, FindOptionsWhere } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import DataLoader from 'dataloader';

type IEntityWithId = Record<string, any> & { id: number | string };

interface IRelationParams {
  relation: string;
  relationDto: new () => any;
}

interface IEntityDataLoaderParams<Entity extends IEntityWithId> {
  entity: EntityTarget<Entity>;
  relations: IRelationParams[];
  repository: Repository<Entity>;
  dto: new () => any;
}

export class DataLoaderInfrastructure {
  private static dataLoaders: Map<string, DataLoader<any, any>> = new Map();

  static getDataLoader<Entity extends IEntityWithId> (params: IEntityDataLoaderParams<Entity>): DataLoader<any, any> {
    const entityName = typeof params.entity === 'function' ? params.entity.name : params.entity;
    const loaderKey = `${entityName}_${params.relations.map(r => r.relation).join('_')}`;

    if (this.dataLoaders.has(loaderKey)) {
      return this.dataLoaders.get(loaderKey)!;
    }

    const loader = new DataLoader(async (ids: readonly any[]) => {
      const data = await params.repository.find({ where: { id: In(ids) } as FindOptionsWhere<Entity>, relations: params.relations.map(r => r.relation) });

      return ids.map(id => {
        const item = data.find(item => item.id === id);

        if (!item) {
          return params.relations.reduce((acc, { relationDto, relation }) => {
            acc[relation] = plainToInstance(relationDto, {}, { excludeExtraneousValues: true });
            return acc;
          }, {} as any);
        }

        const transformedItem = {
          ...item,
          ...params.relations.reduce((acc, { relation, relationDto }) => {
            acc[relation] = plainToInstance(relationDto, item[`__${relation}__`] || {}, { excludeExtraneousValues: true });
            return acc;
          }, {} as Record<string, any>)
        };

        return plainToInstance(params.dto, transformedItem, { excludeExtraneousValues: true });
      });
    });

    this.dataLoaders.set(loaderKey, loader);

    return loader;
  }
}
