./build.sh
git add -u .
git commit -m 'build'
git checkout gh-pages
git merge master
cp -r website/.
git add -u .
git commit -m 'build'
git push
git checkout master
