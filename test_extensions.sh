for d in builtin/*/ ; do
  echo "Testing $d"
  cd $d
  npm install
  npm run test
  cd ../../
done