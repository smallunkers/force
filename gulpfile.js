const gulp = require('gulp')
const stylus = require('gulp-stylus')
const autoprefixer = require('gulp-autoprefixer')


gulp.task('styles', () => {
  gulp.src('src/index.styl')
    .pipe(stylus())
    .pipe(autoprefixer({
      browsers: ['last 5 Chrome versions', 'last 5 Firefox versions', 'Safari >= 6', 'ie > 8'],
    }))
    .pipe(gulp.dest('lib'))
})

gulp.task('default', ['styles'])
