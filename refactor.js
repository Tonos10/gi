const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const unusedFiles = [
  'src/components/GlassButton.tsx',
  'src/components/GlassCard.tsx',
  'src/components/GlassInput.tsx',
  'src/components/GlassPanel.tsx',
  'src/components/GlassTransactionModal.tsx',
  'src/components/LiquidGlassSurface.tsx'
];

const renames = {
  'AmountInput': { file: 'EntradaMonto', desc: 'Entrada de monto monetario' },
  'Button': { file: 'Boton', desc: 'Botón principal de la aplicación' },
  'CircularProgress': { file: 'ProgresoCircular', desc: 'Barra de progreso circular' },
  'DepositModal': { file: 'ModalDeposito', desc: 'Modal para depositar dinero' },
  'GoalCalendar': { file: 'CalendarioMeta', desc: 'Calendario para seleccionar fechas de meta' },
  'GoalCard': { file: 'TarjetaMeta', desc: 'Tarjeta que muestra información de la meta' },
  'IconButton': { file: 'BotonIcono', desc: 'Botón con icono' },
  'Input': { file: 'Entrada', desc: 'Campo de entrada de texto genérico' },
  'SwitchRow': { file: 'FilaInterruptor', desc: 'Fila con interruptor de encendido/apagado' },
  'TransactionItem': { file: 'ElementoTransaccion', desc: 'Elemento individual de transacción' },
  'TransactionModal': { file: 'ModalTransaccion', desc: 'Modal para ver detalles de transacción' },
  'WithdrawModal': { file: 'ModalRetiro', desc: 'Modal para retirar dinero' },
};

// 1. Delete unused files
for (const file of unusedFiles) {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log(`Deleted: ${file}`);
  }
}

// Helper to get all files
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allFiles = getAllFiles(srcDir);

// 2. Rename components in their files and update imports everywhere
for (let file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  for (const [oldName, newInfo] of Object.entries(renames)) {
    const newName = newInfo.file;
    
    // Update imports: import { OldName } from '.../OldName'
    // Regex to catch imports
    const importRegex = new RegExp(`import\\s+\\{([^}]*)\\b${oldName}\\b([^}]*)\\}\\s+from\\s+['"]([^'"]+)['"]`, 'g');
    if (importRegex.test(content)) {
      content = content.replace(importRegex, (match, p1, p2, p3) => {
        let newP3 = p3;
        if (newP3.endsWith(oldName)) {
          newP3 = newP3.slice(0, -oldName.length) + newName;
        }
        return `import {${p1}${newName}${p2}} from '${newP3}'`;
      });
      changed = true;
    }

    // Update JSX tags: <OldName ... /> or <OldName>...</OldName>
    const jsxSelfCloseRegex = new RegExp(`<${oldName}(\\s|/)`, 'g');
    if (jsxSelfCloseRegex.test(content)) {
      content = content.replace(jsxSelfCloseRegex, `<${newName}$1`);
      changed = true;
    }
    const jsxCloseRegex = new RegExp(`</${oldName}>`, 'g');
    if (jsxCloseRegex.test(content)) {
      content = content.replace(jsxCloseRegex, `</${newName}>`);
      changed = true;
    }
    
    // Default or named export of the component
    // export const OldName = ...
    const exportRegex = new RegExp(`export\\s+const\\s+${oldName}\\s*=`, 'g');
    if (exportRegex.test(content)) {
      content = content.replace(exportRegex, `export const ${newName} =`);
      changed = true;
      
      // Inject Spanish comment right above the export if not already there
      const comment = `// Componente: ${newName} - ${newInfo.desc}\n`;
      if (!content.includes(`// Componente: ${newName}`)) {
         content = content.replace(new RegExp(`export\\s+const\\s+${newName}\\s*=`), `${comment}export const ${newName} =`);
      }
    }
    
    // function OldName( ...
    const funcRegex = new RegExp(`function\\s+${oldName}\\s*\\(`, 'g');
    if (funcRegex.test(content)) {
      content = content.replace(funcRegex, `function ${newName}(`);
      changed = true;

      const comment = `// Componente: ${newName} - ${newInfo.desc}\n`;
      if (!content.includes(`// Componente: ${newName}`)) {
         content = content.replace(new RegExp(`function\\s+${newName}\\s*\\(`), `${comment}function ${newName}(`);
      }
    }
    
    // React.FC<OldNameProps> -> React.FC<NewNameProps>
    const propsRegex = new RegExp(`${oldName}Props`, 'g');
    if (propsRegex.test(content)) {
      content = content.replace(propsRegex, `${newName}Props`);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated content in: ${file}`);
  }
}

// 3. Actually rename the files
for (const [oldName, newInfo] of Object.entries(renames)) {
  const newName = newInfo.file;
  const oldPath = path.join(srcDir, 'components', `${oldName}.tsx`);
  const newPath = path.join(srcDir, 'components', `${newName}.tsx`);
  
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed file: ${oldName}.tsx -> ${newName}.tsx`);
  }
}

console.log("Refactoring complete.");
