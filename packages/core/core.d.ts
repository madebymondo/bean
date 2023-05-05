declare module "@bean/core" {
  import { Express } from "express";

  /**
   * Configuration options for .bean.json
   */
  interface BeanConfig {
    /**
     *  Directory for all file based routing
     * */
    pagesDirectory?: string;
    /**
   *  An array of paths that will be automatically 
  passedthrough during the build 
  */
    passthroughDirectories?: string[];
    /**
     * Directory for templates and views
     */
    viewsDirectory?: string;
    /**
     * Directories and files to watch for server and frontend updates
     */
    watchTargets: string[];
    /** 
   Output path for the site 
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
  }

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
    app: Express;
  }

  interface RenderBuildTemplateParams {
    engine: BeanConfig["templateEngine"];
    views: BeanConfig["viewsDirectory"];
    template: string;
    data: any;
  }

  interface GenerateServerTemplateParams {
    templateEngine: BeanConfig["templateEngine"];
    pagesDirectory: BeanConfig["pagesDirectory"];
    viewsDirectory: BeanConfig["viewsDirectory"];
    port: number;
  }
}
