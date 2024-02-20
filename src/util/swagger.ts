import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeName } from 'swagger-themes'

/**
 * Swagger 세팅
 *
 * @param {INestApplication} app
 */
export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('Bridge API Docs')
    .setDescription('Bridge API Documents with Swagger')
    .setVersion('1.0.0')
    .build();

    const addCss = `
      * {
        letter-spacing: -0.5px
      }
      html {
        background-image: url(public/bg.jpeg)!important;
      }
      body {
        background: unset;
      }
      .topbar, .title span { display: none!important; }
      .arrow { fill: white }
      .swagger-ui > div .wrapper .block{ border-radius: 8px; padding: 0px; }
      .swagger-ui > div .wrapper:not(.information-container) .block, .topbar{ background-color: rgba(255,255,255,.05)!important;-webkit-backdrop-filter: blur(10px);backdrop-filter: blur(10px);}
      .swagger-ui .no-margin { padding: 20px; }
      .swagger-ui .opblock-tag, .swagger-ui section.models h4{ padding: 20px; }
      .swagger-ui .opblock-tag { margin: 0 }
      .swagger-ui .opblock-body pre.microlight, .swagger-ui textarea.curl { background-color: #111!important; line-height: 1.4; padding: 16px!important; border-radius: 8px; }
      .swagger-ui .opblock .opblock-section-header { background-color: #111!important; border-radius: 8px; }
      .swagger-ui .opblock-tag { font-size: 20px; }
      .swagger-ui .opblock-tag .nostyle span::before {content:'\\2022'}
      .swagger-ui .inner-object > .model {margin-top: 10px}
    `
  const theme = new SwaggerTheme();
  const themeOptions = {
    explorer: true,
    customCss: theme.getBuffer('dark' as SwaggerThemeName) + addCss,
    customfavIcon: "public/favicon.ico",
    customSiteTitle:'Bridge API Docs',
    swaggerOptions: {
      docExpansion: 'none'
    }
  };
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document, themeOptions);
}
