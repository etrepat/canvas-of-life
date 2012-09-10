# encoding: utf-8

require 'pathname'
require 'fileutils'
require 'logger'

require 'bundler'
Bundler.require

module CanvasOfLife
  class Compiler
    def initialize(args={})
      self.logger = Logger.new($stderr)
      self.logger.level = Logger::INFO

      @root   = Pathname.new(args.fetch(:root, '.')).expand_path
      @paths  = args.fetch(:paths, [])
      @assets = args.fetch(:assets, [])
      @output = args.fetch(:output, './output')
    end

    attr_reader :root, :paths, :assets, :output

    attr_accessor :logger

    def compile(*args)
      options = {:minify => false}
      options.merge!(args.pop) if args.last.is_a?(Hash)

      environment.js_compressor = nil

      logger.info "Building: #{root}"

      assets = args.empty? ? self.assets : args.flatten
      environment.each_logical_path(assets) do |path|
        asset = environment.find_asset(path)
        if asset
          write_asset asset

          if options[:minify]
            environment.js_compressor = UglyCompressor unless environment.js_compressor
            write_asset environment.find_asset(path), options
          end
        end
      end
    end

    private

    def environment
      @environment ||= begin
        env = Sprockets::Environment.new(root)
        paths.each { |path| env.append_path root.join(path) }
        env.register_bundle_processor 'application/javascript', AnonymousWrapper
        env
      end
    end

    def write_asset(asset, options={})
      path      = asset.logical_path
      path      = minified_path(path) if options[:minify]
      target    = Pathname(output)
      filename  = target.join(path)

      logger.info "Writing #{filename}"

      FileUtils.mkpath filename.dirname

      asset.write_to(filename)
      # asset.write_to("#{filename}.gz") if options[:minify]

      asset
    end

    def minified_path(path)
      ext      = File.extname(path)
      filename = File.basename(path, ext)
      "#{filename}-min#{ext}"
    end
  end


  class UglyCompressor
    class << self
      def compress(source, options={})
        new.compress(source, options)
      end
    end

    def compress(source, options={})
      Uglifier.compile(source, options)
    end
  end

  # Wraps concatenated JS files into an anonymous function
  class AnonymousWrapper < Tilt::Template
    def prepare
    end

    def evaluate(context, locals, &block)
      wrapped = <<WRAP
(function(window) {

"use strict";

#{data}
})(this);
WRAP
      wrapped
    end
  end
end

desc "Build scripts"
task :build do
  compiler = CanvasOfLife::Compiler.new :root => './', :paths => %w(lib),
    :assets => %w( canvas-of-life.js ), :output => './dist'
  compiler.compile :minify => true
end

task :default => :build
