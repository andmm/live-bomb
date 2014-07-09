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
                            'css/**'
                            'fonts/**'
                            'images/**'
                            'js/**'
                            'sounds/**'
                            'square/**'
                        ]
                        dest: 'dist'
                        filter: 'isFile'
                        expand: true
                    }
                ]

    # Grunt Contrib Tasks
    grunt.loadNpmTasks "grunt-contrib-clean"
    grunt.loadNpmTasks "grunt-contrib-copy"
    grunt.loadNpmTasks "grunt-contrib-uglify"
    grunt.loadNpmTasks "grunt-contrib-watch"
    grunt.loadNpmTasks "grunt-contrib-less"

    # Grunt Tasks
    grunt.registerTask "default", [
        "clean", "copy"
    ]
