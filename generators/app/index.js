var Generator = require('yeoman-generator');

module.exports = class extends Generator {

    prompting() {
        var gitName = this.user.git.name();

        return this.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Your project name',
                default: this.appname
            },
            {
                type: 'input',
                name: 'description',
                message: 'Project description',
                default: 'API.AI webhook'
            },
            {
                type: 'input',
                name: 'author',
                message: "Author's name",
                default: gitName
            },
            {
                type: 'input',
                name: 'license',
                message: "Project license"
            }
        ]).then(this._handleAnswers.bind(this));
    }

    _handleAnswers(answers) {
        answers.name = answers.name.split(/\s/).join('-');
        this.answers = answers;
    }

    createCode() {
        this.log('Creating code files...');

        this.fs.copyTpl(
            this.templatePath('index.js'),
            this.destinationPath('src/index.js'),
            this.answers
        );

        this.fs.copyTpl(
            this.templatePath('gulpfile.js'),
            this.destinationPath('gulpfile.js'),
            this.answers
        );

        this.fs.copyTpl(
            this.templatePath('lambda-vars.json'),
            this.destinationPath('lambda-vars.json'),
            this.answers
        );
    }

    configuring() {
        this.fs.copyTpl(
            this.templatePath('package.json'),
            this.destinationPath('package.json'),
            this.answers
        );
    }

    install() {
        this.log('Installing dependencies...');
        return new Promise((resolve, reject) => {        
            this.npmInstall(
                [
                    'lambda-bot'
                ], 
                {'save': true});

            this.npmInstall(
                [
                    'gulp',
                    'gulp-babel',
                    'gulp-clean',
                    'gulp-exec',
                    'claudia',
                    'babel-core',
                    'babel-preset-es2015',
                    'babel-preset-es2016',
                    'babel-preset-es2017'
                ],
                {'save-dev': true}
            );

            resolve();
        });
    }

    end() {
        this.log('Building Lambda...');
        this.spawnCommandSync('node_modules/.bin/gulp');

        this.log('Initializing Claudia...');

        this.spawnCommandSync(this.destinationPath('node_modules/.bin/claudia'), 
            [
                'create',
                '--region',
                'us-east-1',
                '--handler',
                'index.handler',
                '--deploy-proxy-api'
            ],
            {
                "cwd": this.destinationPath('dist')
            }
        );
        
        this.fs.copyTpl(
            this.destinationPath('dist/claudia.json'),
            this.destinationPath('claudia.json'),
            {}
        );
    }
};