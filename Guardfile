# encoding: utf-8

require 'bundler'
Bundler.require

require 'guard/guard'

module ::Guard
  class Rake < Guard
    include ::Rake::DSL

    def initialize(watchers=[], options={})
      @task = options[:task] || 'default'
      super
    end

    def start
      load 'Rakefile'
    end

    def run_all
      exec_rake_task
    end

    def run_on_change(paths)
      exec_rake_task
    end

    private

    def exec_rake_task
      ::Rake::Task[@task].execute
      Notifier.notify "Executed #{@task}.", :title => "Guard", :image => :success
    end
  end
end

guard :rake, :task => 'build' do
  watch %r{^lib/.+$}
end
