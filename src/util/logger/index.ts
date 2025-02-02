import { Logger, QueryRunner } from "typeorm";
import chalk from "chalk";
import { Client } from "@elastic/elasticsearch";

export class CustomLogger implements Logger {
  private readonly elasticsearchClient: Client;

  constructor() {
    this.elasticsearchClient = new Client({ node: "http://localhost:9200" }); // Elasticsearch URL 설정
  }

  private async sendToElasticsearch(level: string, message: any) {
    // TODO: elastic-search 서버 구현 후 주석 해제
    // try {
    //   await this.elasticsearchClient.index({
    //     index: "typeorm-logs", // 원하는 Elasticsearch 인덱스 이름
    //     body: {
    //       level,
    //       ...message, // 메시지 전체를 추가
    //       timestamp: new Date().toISOString(),
    //     },
    //   });
    // } catch (error) {
    //   console.error("Failed to send log to Elasticsearch", error);
    // }
  }

  private getQueryType(query: string): string {
    const queryType = query.trim().split(" ")[0].toUpperCase();
    const validTypes = ["SELECT", "INSERT", "UPDATE", "DELETE"];
    return validTypes.includes(queryType) ? queryType : "OTHER";
  }

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    const formattedQuery = query
        .replace(/\$(\d+)/g, (_, i) =>
            parameters && parameters[parseInt(i, 10) - 1] !== undefined
                ? `'${parameters[parseInt(i, 10) - 1]}'`
                : "?"
        )
        .replace(
            /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|GRANT|REVOKE|COMMIT|ROLLBACK|FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|CROSS JOIN|UNION|UNION ALL|INTERSECT|EXCEPT|CASE|WHEN|THEN|ELSE|END|AS|ON|IN|NOT IN|IS NULL|IS NOT NULL|LIKE|ILIKE|BETWEEN|AND|OR|DISTINCT|AS|AS|ASC|DESC)\b/g,
            (match) => chalk.blue(match)
        );

    const queryType = this.getQueryType(query); // 쿼리 유형 추출

    console.log(chalk.green(`[query]: `) + chalk.white(formattedQuery)); // query 부분은 녹색, 쿼리 부분은 하얀색
    this.sendToElasticsearch("query", {
      query: formattedQuery,
      parameters,
      type: queryType, // 쿼리 유형 추가
    });
  }

  logQueryError(
      error: string,
      query: string,
      parameters?: any[],
      queryRunner?: QueryRunner
  ) {
    const queryType = this.getQueryType(query);

    console.error(chalk.red(`[query failed]: ${error}`));
    console.error(chalk.red(`[query]: ${query}`));
    if (parameters) {
      console.error(chalk.red(`parameters: ${JSON.stringify(parameters)}`));
    }
    this.sendToElasticsearch("error", { error, query, parameters, type: queryType });
  }

  logQuerySlow(
      time: number,
      query: string,
      parameters?: any[],
      queryRunner?: QueryRunner
  ) {
    const queryType = this.getQueryType(query);

    console.warn(chalk.yellow(`query is slow: ${time}ms`));
    console.warn(chalk.yellow(`[query]: ${query}`));
    if (parameters) {
      console.warn(chalk.yellow(`parameters: ${JSON.stringify(parameters)}`));
    }
    this.sendToElasticsearch("slow-query", {
      time,
      query,
      parameters,
      type: queryType,
    });
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    console.log(chalk.magenta(`[schema build]: ${message}`));
    this.sendToElasticsearch("schema-build", { message });
  }

  logMigration(message: string, queryRunner?: QueryRunner) {
    console.log(chalk.cyan(message));
    this.sendToElasticsearch("migration", { message });
  }

  log(
      level: "log" | "info" | "warn" | "start" | "end",
      message: any,
      queryRunner?: QueryRunner
  ) {
    const color =
        level === "log"
            ? chalk.green
            : level === "info"
                ? chalk.blue
                : level === "start" || level === "end"
                    ? chalk.grey
                    : chalk.yellow;

    if (level === "start") console.log("");
    console.log(color(`[${level}] ${message}`));
    if (level === "end") console.log("");
    this.sendToElasticsearch(level, { message });
  }
}

export const logger = new CustomLogger();
