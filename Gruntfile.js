module.exports = function(grunt) {
    require('grunt');
    
    var config_file_name = 'config.json';
    var auth_file_name = 'auth.json';
    
    var config = { auth: {} };
    
    
    if ( grunt.file.exists(config_file_name) ) {
    
        config = grunt.file.readJSON('config.json');

        config.js_files = grunt.file.expand( 'src/javascript/*.js' );
        config.css_files = grunt.file.expand( 'src/style/*.css' );
        config.checksum = "<!= checksum !>";
        
        config.js_contents = " ";
        for (var i=0;i<config.js_files.length;i++) {
            grunt.log.writeln( config.js_files[i]);
            config.js_contents = config.js_contents + "\n" + grunt.file.read(config.js_files[i]);
        }
    
        config.style_contents = "";
        for (var i=0;i<config.css_files.length;i++) {
            grunt.log.writeln( config.css_files[i]);
            config.style_contents = config.style_contents + "\n" + grunt.file.read(config.css_files[i]);
        }
    }
    if ( grunt.file.exists(auth_file_name) ) {
    // grunt.log.writeln( config.js_contents );
        var auth = grunt.file.readJSON(auth_file_name);
        config.auth = auth
    }
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        template: {
                dev: {
                        src: 'templates/App-debug-tpl.html',
                        dest: 'App-debug.html',
                        engine: 'underscore',
                        variables: config
                },
                prod: {
                        src: 'templates/App-tpl.html',
                        dest: 'deploy/App.html',
                        engine: 'underscore',
                        variables: config
                }
        },
        jasmine: {
            fast: {
                src: 'src/**/*.js',
                options: {
                    specs: 'test/fast/*-spec.js',
                    helpers: 'test/fast/*Helper.js',
                    template: 'test/fast/custom.tmpl',
                    templateOptions: config,
                    keepRunner: true,
                    junit: { 
                        path: 'test/logs/fast'
                    }
                }
            },
            slow: {
                src: 'src/**/*.js',
                options: {
                    specs: 'test/slow/*-spec.js',
                    helpers: 'test/slow/*Helper.js',
                    template: 'test/slow/custom.tmpl',
                    templateOptions: config,
                    keepRunner: true,
                    timeout: 50000,
                    junit: { 
                        path: 'test/logs/slow'
                    }
                }
            }
        }
    });
    
    grunt.registerTask('setChecksum', 'Create .md5 checksum file *', function() {
        var deploy_file = 'deploy/App.html';
        
        var fs = require('fs');
        var crypto = require('crypto');
        md5 = crypto.createHash('md5');
        var file = grunt.file.read(deploy_file);
        md5.update(file);
        var md5Hash = md5.digest('hex');
        grunt.log.writeln('file md5: ' + md5Hash);
// 
        grunt.template.addDelimiters('square-brackets','[%','%]');
        
        var output = grunt.template.process(file, { data: { checksum: md5Hash },  delimiters: 'square-brackets' });
        grunt.file.write(deploy_file,output);
        
//        // Create new file with the same name with .md5 extension
//        var md5FileName = file + '.md5';
//        grunt.file.write(md5FileName, md5Hash);
//        grunt.log.write('File "' + md5FileName + '" created.').verbose.write('...').ok();
    });

    //load
    grunt.loadNpmTasks('grunt-templater');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    
    //tasks
    grunt.registerTask('default', ['debug','build']);
    
    // (uses all the files in src/javascript)
    grunt.registerTask('build', "Create the html for deployment",['template:prod','setChecksum']);
    // 
    grunt.registerTask('debug', "Create an html file that can run in its own tab", ['template:dev']);
   
    grunt.registerTask('test-fast', "Run tests that don't need to connect to Rally", ['jasmine:fast']);
    grunt.registerTask('test-slow', "Run tests that need to connect to Rally", ['jasmine:slow']);

};
