declare module "@bean/core" {
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
    templateEngine?: "njk" | "liquid" | "preact";
  }

  interface PageContext {
    /**
  Generated path for the page (ex. '/about') 
  */
    path: string;
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
    /**
     * This will prerender the page on build if you are
     * using the 'server' render mode. You can omit this
     * if you are using the "ssg" render mode.
     *  */
    prerender?: boolean;
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
}
