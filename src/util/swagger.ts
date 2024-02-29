import { INestApplication } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { SwaggerTheme, SwaggerThemeName } from "swagger-themes";

/**
 * Swagger 세팅
 *
 * @param {INestApplication} app
 */
export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle("Bridge API Docs")
    .setDescription("Bridge API Documents with Swagger")
    .setVersion("1.0.0")
    .build();

  const addCss = `
      * {
        letter-spacing: -0.5px
      }
      html {
        background-image: url(public/swg-bg.jpeg)!important;
        background-repeat: no-repeat!important;
        background-size: cover!important;
        height: 100%;
        overflow: hidden;
      }
      body {
        background: unset;
      }
      body > #swagger-ui { position: fixed; width: 100%; height: 100%; overflow-y: auto; }
      .topbar, .title span { display: none!important; }
      .title { width: 320px; height: 44px; background-image: url(public/bad-logo.png); background-size: 100%; background-repeat: no-repeat; background-position: center left; font-size: 0!important; }
      .arrow { fill: white; }
      .swagger-ui > div .wrapper .block{ padding: 0px; }
      .swagger-ui > div .wrapper:not(.information-container) .block, .topbar{ background-color: #00022380!important;-webkit-backdrop-filter: blur(10px);backdrop-filter: blur(10px);}
      .swagger-ui .no-margin { padding: 20px; border-bottom: 1px solid #b0bdff40 }
      .swagger-ui .opblock-tag, .swagger-ui section.models.is-open h4, .swagger-ui section.models h4 {border-color: transparent; padding: 20px; color: #fff}
      .swagger-ui .opblock-tag, .swagger-ui section.models h4 { margin: 0; background: rgba(0,0,0,.2); }
      .swagger-ui .opblock-tag:hover, .swagger-ui section.models h4:hover {background: rgba(0,0,0,.3);}
      .swagger-ui section.models h4 > button, .swagger-ui section.models h4:hover > button { background-color: unset; }
      .swagger-ui .opblock-body pre.microlight, .swagger-ui textarea.curl { background-color: #111!important; line-height: 1.4; padding: 16px!important; border-radius: 8px; }
      .swagger-ui .opblock .opblock-section-header { background-color: #111!important; border-radius: 8px; }
      .swagger-ui .opblock-tag { font-size: 16px; }
      .swagger-ui .opblock-tag .nostyle span::before { content:'\\2022'; }
      .swagger-ui .inner-object > .model {margin-top: 10px}
      .swagger-ui .opblock .opblock-summary-path{
        color: #fff!important
      }
      .swagger-ui .opblock .opblock-summary-operation-id, .swagger-ui .opblock .opblock-summary-path, .swagger-ui .opblock .opblock-summary-path__deprecated { font-size: 14px!important }
      
      .swagger-ui section.models .model-container { background-color: rgba(0,0,0,.2) }
      .swagger-ui section.models .model-container:hover { background-color: rgba(0,0,0,.3) }

      .swagger-ui table thead tr td, .swagger-ui table thead tr th{ border-color: #b0bdff40 }
    `;
  const theme = new SwaggerTheme();
  const themeOptions = {
    explorer: true,
    customCss: theme.getBuffer("dark" as SwaggerThemeName) + addCss,
    customfavIcon: "public/favicon.ico",
    customSiteTitle: "Bridge API Docs",
    swaggerOptions: {
      docExpansion: "none",
    },
  };
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup("api-docs", app, document, themeOptions);
}
