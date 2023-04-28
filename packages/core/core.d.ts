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
  buildOutputPath: string;
  /**
   *  Rendering mode for the site
   * */
  renderMode: "ssg" | "server";
  /**
   *  Template engine to use for rendering
   * */
  templateEngine: "njk" | "liquid" | "preact";
}
