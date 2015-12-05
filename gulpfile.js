var gulp = require('gulp');
var elm  = require('gulp-elm');

gulp.task('elm-init', elm.init);

gulp.task('elm', ['elm-init'], function(){
  return gulp.src('elm-src/HtmlToElmWebsite/Main.elm')
    .pipe(elm())
    .pipe(gulp.dest('website/js/'));
});

// Rerun the task when a file changes
gulp.task('watch', ['elm'],  function() {
  gulp.watch(['elm-src/**/*.elm'], ['elm']);
});
