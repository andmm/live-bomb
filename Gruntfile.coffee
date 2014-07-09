module.exports = (grunt) ->
    "use strict"

    grunt.initConfig
        clean: ["dist/"]

        copy:
            release:
                files: [
                    {
                        src: [
                            'manifest.json'
                            'popup.html'
                            'css/*.css'
                            'images/**'
                            'sounds/**'
                        ]
                        dest: 'dist'
                        filter: 'isFile'
                        expand: true
                    },
                    {
                        src: [
                            'fonts/**'
                        ]
                        cwd: 'vendor/bower/fontawesome/'
                        dest: 'dist'
                        filter: 'isFile'
                        expand: true
                    },
                    {
                        src: [
                            'grey.png'
                        ]
                        cwd: 'vendor/bower/iCheck/skins/square/'
                        dest: 'dist/css'
                        filter: 'isFile'
                        expand: true
                    }

                ]

        less:
            dist:
                options:
                    paths: ['css']
                files:
                    'dist/css/style.min.css': 'css/app.less'

        uglify:
            dist:
                # options:
                #     # For debugging/testing
                #     beautify: true
                #     preserveComments: true;
                files:
                    'dist/js/background.min.js': [
                        'js/lib/ga.js'

                        'vendor/bower/jquery/dist/jquery.js'

                        'vendor/bower/jQuery-Storage-API/jquery.storageapi.js'

                        'vendor/bower/ion.sound/js/ion.sound.js'

                        'vendor/bower/moment/moment.js'

                        'vendor/bower/moment-timezone/builds/moment-timezone-with-data-2010-2020.js'

                        'js/functions.js'
                        'js/background.js'
                    ]
                    'dist/js/frontend.min.js': [
                        'vendor/bower/jquery-ui/jquery-ui.js'

                        'vendor/bower/bootstrap/js/transition.js'
                        'vendor/bower/bootstrap/js/alert.js'
                        'vendor/bower/bootstrap/js/button.js'
                        'vendor/bower/bootstrap/js/carousel.js'
                        'vendor/bower/bootstrap/js/collapse.js'
                        'vendor/bower/bootstrap/js/dropdown.js'
                        'vendor/bower/bootstrap/js/modal.js'
                        'vendor/bower/bootstrap/js/tooltip.js'
                        'vendor/bower/bootstrap/js/popover.js'
                        'vendor/bower/bootstrap/js/scrollspy.js'
                        'vendor/bower/bootstrap/js/tab.js'
                        'vendor/bower/bootstrap/js/affix.js'

                        'vendor/bower/iCheck/icheck.js'

                        'vendor/bower/jquery.slimscroll/jquery.slimscroll.js'

                        'js/livebomb.js'
                    ]

        watch:
            less:
                files: ['css/*']
                tasks: ['less']
            copy:
                files: ['manifest.json', 'popup.html', 'css/*.css', 'images/*', 'sounds/*']
                tasks: ['clean', 'copy', 'less', 'uglify']
            uglify:
                files: ['js/*']
                tasks: ['uglify']


    # Grunt Contrib Tasks
    grunt.loadNpmTasks "grunt-contrib-clean"
    grunt.loadNpmTasks "grunt-contrib-copy"
    grunt.loadNpmTasks "grunt-contrib-uglify"
    grunt.loadNpmTasks "grunt-contrib-watch"
    grunt.loadNpmTasks "grunt-contrib-less"

    # Grunt Tasks
    grunt.registerTask "default", [
        "clean", "copy", "less", "uglify"
    ]

    grunt.registerTask "dev", [
        "clean", "copy", "less", "uglify", "watch"
    ]
