import { Logger, QueryRunner } from 'typeorm';
import chalk from 'chalk';

export class CustomLogger implements Logger {
  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    const formattedQuery = query.replace(/\$(\d+)/g, (_, i) => 
      parameters && parameters[parseInt(i, 10) - 1] !== undefined 
        ? `'${parameters[parseInt(i, 10) - 1]}'`
        : '?'
    ).replace(/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|GRANT|REVOKE|COMMIT|ROLLBACK|FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|CROSS JOIN|UNION|UNION ALL|INTERSECT|EXCEPT|CASE|WHEN|THEN|ELSE|END|AS|ON|IN|NOT IN|IS NULL|IS NOT NULL|LIKE|ILIKE|BETWEEN|AND|OR|DISTINCT|AS|AS|ASC|DESC)\b/g, (match) => 
      chalk.blue(match)
    );
    
    console.log(chalk.green(`query: `) + chalk.white(formattedQuery)); // query 부분은 녹색, 쿼리 부분은 하얀색
  }

  logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner) {
    console.error(chalk.red(`query failed: ${error}`));
    console.error(chalk.red(`query: ${query}`));
    if (parameters) {
      console.error(chalk.red(`parameters: ${JSON.stringify(parameters)}`));
    }
  }

  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner) {
    console.warn(chalk.yellow(`query is slow: ${time}ms`));
    console.warn(chalk.yellow(`query: ${query}`));
    if (parameters) {
      console.warn(chalk.yellow(`parameters: ${JSON.stringify(parameters)}`));
    }
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    console.log(chalk.magenta(message));
  }

  logMigration(message: string, queryRunner?: QueryRunner) {
    console.log(chalk.cyan(message));
  }

  log(level: 'log' | 'info' | 'warn' | 'start' | 'end', message: any, queryRunner?: QueryRunner) {
    const color = level === 'log' ? chalk.green
      : level === 'info' ? chalk.blue
      : level === 'start' || level === 'end' ? chalk.grey
      : chalk.yellow;
    console.log(color(`[${level}] ${message}`));
  }
}

export const logger = new CustomLogger();