import Knex from "knex";
import { Model, QueryBuilder } from "objection";
import dotenv from "dotenv";

dotenv.config();

export const knex = Knex(process.env.DB_CONN);
Model.knex(knex);

export async function createSchema(force) {
  if (force) {
    await dropTables();
  } else if (await knex.schema.hasTable("surveys")) {
    return false;
  }

  await knex.schema
    .createTable("surveys", (table) => {
      table.increments("id").primary();
      table.string("url");
      table.string("title");
      table.text("body");
      table.string("owner");
      table.text("readers");
      //      table.text("writers");
      table.timestamp("published_at").nullable();
      table.timestamp("deleted_at").nullable();
      table.timestamps(true, true);
    })
    /*
    .createTable("revisions", table => {
      table.increments("id").primary();
      table.text("body");
      table.integer("survey_id").references("surveys.id");
      table.string("author");
      table.boolean("current");
      table.timestamps(true, true);
    })*/
    .createTable("responses", (table) => {
      table.increments("id").primary();
      table.integer("survey_id").references("surveys.id");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.json("resp");
    });

  return true;
}

export async function dropTables() {
  return await knex.schema
    .dropTableIfExists("surveys")
    //    .dropTableIfExists("revisions")
    .dropTableIfExists("responses");
}

export class Survey extends Model {
  $beforeInsert() {
    this.created_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  streamResponses() {
    return this.$knex()
      .select()
      .from(SurveyResponse.tableName)
      .where("survey_id", this.$id())
      .orderBy("created_at", "desc")
      .stream();
  }

  get deleted() {
    return !!this.deleted_at;
  }

  static get tableName() {
    return "surveys";
  }

  static get QueryBuilder() {
    return SurveyQueryBuilder;
  }

  static get relationMappings() {
    return {
      /*      revisions: {
        relation: Model.HasManyRelation,
        modelClass: SurveyRevision,
        join: {
          from: "surveys.id",
          to: "revisions.survey_id"
        }
      },*/
      responses: {
        relation: Model.HasManyRelation,
        modelClass: SurveyResponse,
        join: {
          from: "surveys.id",
          to: "responses.survey_id",
        },
      },
    };
  }
}

class SurveyQueryBuilder extends QueryBuilder {
  delete() {
    return this.patch({ deleted_at: new Date() });
  }

  hardDelete() {
    return super.delete();
  }

  notDeleted() {
    return this.whereNull("deleted_at");
  }

  wasDeleted() {
    return this.whereNotNull("deleted_at");
  }

  ownedBy(owner) {
    return this.where({ owner });
  }

  canRead(user) {
    const pattern = `% ${user} %`;
    return this.where((b) => {
      b.canWrite(user).orWhere("readers", "like", pattern);
    });
  }

  canWrite(user) {
    //    const pattern = `% ${user} %`;
    return this.ownedBy(user); //.orWhere("writers", "like", pattern);
  }

  deletedBy(owner) {
    return this.ownedBy(owner).whereNotNull("deleted_at");
  }

  publishedOn(url) {
    return this.whereNotNull("published_at").andWhere({ url });
  }
}

/*
export class SurveyRevision extends Model {
  static get modifiers() {
    return {
      current(builder) {
        builder.where("current", true);
      },
      latestFirst(builder) {
        builder.orderBy("updated_at", "desc");
      }
    };
  }

  static get tableName() {
    return "revisions";
  }

  static get relationMappings() {
    return {
      surveys: {
        relation: Model.BelongsToOneRelation,
        modelClass: Survey,
        join: {
          from: "revisions.survey_id",
          to: "surveys.id"
        }
      }
    };
  }
}
*/

export class SurveyResponse extends Model {
  static get tableName() {
    return "responses";
  }

  static get relationMappings() {
    return {
      surveys: {
        relation: Model.BelongsToOneRelation,
        modelClass: Survey,
        join: {
          from: "responses.survey_id",
          to: "surveys.id",
        },
      },
    };
  }
}
