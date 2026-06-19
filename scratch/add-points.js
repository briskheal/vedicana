import fs from 'fs';
import path from 'path';

function updateUserModel() {
  const file = path.join(process.cwd(), 'src/models/User.js');
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('points: {')) {
    content = content.replace(
      /hasSpunWheel: \{\s*type: DataTypes\.BOOLEAN,\s*defaultValue: false\s*\},/g,
      "hasSpunWheel: {\n    type: DataTypes.BOOLEAN,\n    defaultValue: false\n  },\n  points: {\n    type: DataTypes.INTEGER,\n    defaultValue: 0\n  },"
    );
    fs.writeFileSync(file, content);
    console.log("Updated User.js model");
  }
}

updateUserModel();
