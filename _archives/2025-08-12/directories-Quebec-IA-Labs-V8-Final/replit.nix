{ pkgs }: {
  deps = [
    pkgs.nodejs-20_x
    pkgs.nodePackages.npm
    pkgs.curl
    pkgs.git
  ];
  
  env = {
    NODE_ENV = "production";
    NPM_CONFIG_PREFIX = "/home/runner/.config/npm/npm_global";
  };
}