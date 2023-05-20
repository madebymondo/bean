declare module "@bean/core" {
  import { Express } from "express";
  /**
   * Configuration options for .bean.json
   */
  interface BeanConfig {
    /** Base directory for the project (defaults to: 'src') */
    baseDirectory: string;
    /**
     *  Directory for all file based routing relative to the base
     * */
    pagesDirectory?: string;
    /**
     * Directory for templates and views relative to the base
     */
    viewsDirectory?: string;
    /**
     *  An array of paths that will be automatically
     * passed through during the build relative to project root
     */
    passthroughDirectories?: string[];
    /**
     * Directories and files relative to the base to watch for frontend updates
     */
    watchTargets?: string[];
    /**
     * Watch targets relative to the base for server updates
     */
    serverWatchTargets?: string[];
    /**
     * Output path for the site relative to project root
     */
    buildOutputPath?: string;
    /**
     *  Rendering mode for the site
     * */
    renderMode?: "ssg" | "server";
    /**
     *  Template engine to use for rendering
     * */
    templateEngine?: "njk" | "preact";
    templateFilters: TemplateFilterFunction[];
    /** Access Express app. This will only work if in development or server mode */
    server?: (app: Express) => void;
  }

  /**
   * Callback function that has access to template engine
   */
  type TemplateFilterFunction = (engine: any) => void;

  interface PageContext {
    [key: string]: any;
    /**
     * Page template to use. This is relative to the 'views' path
     * specified in the config file.
     */
    template: string;
    /** 
  Any data you want to send to the template. This can 
  accept any valid object whether it's JS or a response from a CMS.
   */
    data: any;
  }

  interface CreatePageParams {
    /**
     *  Context that will be passed to the template
     * */
    context: PageContext;
    /**
     * A list of paths needed for static site generation.
     * You can omit this if you are using the 'server'
     * render mode.
     */
    paths?: string[];
  }

  interface ServeAppParams {
    pagesDirectory: BeanConfig["pagesDirectory"];
    viewsDirectory: BeanConfig["viewsDirectory"];
    watchTargets: BeanConfig["watchTargets"];
    templateEngine: BeanConfig["templateEngine"];
  }

  interface RenderTemplateEngineParams {
    engine: BeanConfig["templateEngine"];
    views: BeanConfig["viewsDirectory"];
    /** Template file to parse */
    template: string;
    /** Page data sent to render function */
    data: { any };
    app: Express;
    filters?: BeanConfig["templateFilters"];
  }

  interface RenderBuildTemplateParams {
    engine: BeanConfig["templateEngine"];
    views: BeanConfig["viewsDirectory"];
    template: string;
    data: any;
    filters?: BeanConfig["templateFilters"];
  }

  interface GenerateServerTemplateParams {
    templateEngine: BeanConfig["templateEngine"];
    pagesDirectory: BeanConfig["pagesDirectory"];
    viewsDirectory: BeanConfig["viewsDirectory"];
    buildPath: BeanConfig["buildOutputPath"];
    server: BeanConfig["server"];
    port: number;
  }

  interface BuildSiteParams {
    pagesDirectory: BeanConfig["pagesDirectory"];
    outputPath: BeanConfig["buildOutputPath"];
    templateEngine: BeanConfig["templateEngine"];
    views: BeanConfig["viewsDirectory"];
    filters?: BeanConfig["templateFilters"];
  }

  interface BuildServerFilesParams {
    pagesDirectory: BeanConfig["pagesDirectory"];
    outputPath: BeanConfig["buildOutputPath"];
    templateEngine: BeanConfig["templateEngine"];
    views: BeanConfig["viewsDirectory"];
    server: BeanConfig["server"];
    filters?: BeanConfig["templateFilters"];
  }
}
