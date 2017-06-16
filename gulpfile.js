var gulp = require('gulp'),
	connect = require('gulp-connect');

gulp.task('connectDev', function () {
  connect.server({
    name: 'Dev App',
    root: ['app'],
    port: 8000,
    livereload: true
  });
});

gulp.task('html', function () {
  gulp.src('./app/*.html')
    .pipe(connect.reload());
});

gulp.task('js', function () {
  gulp.src('./app/*.js')
    .pipe(connect.reload());
});

gulp.task('css', function () {
  gulp.src('./app/*.css')
    .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch(['./app/*.html','./app/templates/*.html'], ['html']);
  gulp.watch(['./app/assets/js/*.js'], ['js']);
  gulp.watch(['./app/assets/css/*.css'], ['css']);
});
 
gulp.task('default', ['connectDev', 'watch']);