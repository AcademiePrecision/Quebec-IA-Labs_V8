{ pkgs }: {
  deps = [
<<<<<<< HEAD
    pkgs.nodejs-20_x
    pkgs.nodePackages.npm
    pkgs.curl
  ];
  
  env = {
    NODE_ENV = "production";
    NPM_CONFIG_PREFIX = "/home/runner/.config/npm/npm_global";
=======
    # Core Node.js - using stable version 20 for better compatibility
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    pkgs.nodePackages.node-gyp
    
    # System tools
    pkgs.curl
    pkgs.git
    pkgs.htop
    pkgs.which
    
    # Build tools (in case needed for native modules)
    pkgs.python3
    pkgs.gcc
    pkgs.gnumake
  ];
  
  env = {
    # Node environment
    NODE_ENV = "production";
    NPM_CONFIG_PREFIX = "/home/runner/.config/npm/npm_global";
    PATH = "/home/runner/.config/npm/npm_global/bin:/home/runner/.npm-global/bin:$PATH";
    
    # Performance optimizations
    NODE_OPTIONS = "--max-old-space-size=512";
    UV_THREADPOOL_SIZE = "4";
    
    # npm configuration
    NPM_CONFIG_LOGLEVEL = "warn";
    NPM_CONFIG_PRODUCTION = "true";
    
    # Locale settings
    LANG = "en_US.UTF-8";
    LC_ALL = "en_US.UTF-8";
>>>>>>> b656570f498857fe3f9e07bf12ba9ff9550cb611
  };
}