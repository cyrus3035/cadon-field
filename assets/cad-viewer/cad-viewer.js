const canvas = document.getElementById('cad-canvas');
const ctx = canvas.getContext('2d');
const statusBar = document.getElementById('status-bar');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const fileInfoEl = document.getElementById('file-info');

function initViewer() {
  canvas.width = 800;
  canvas.height = 600;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 1;
  
  for (let i = 0; i <= 20; i++) {
    const x = (canvas.width / 20) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  
  for (let i = 0; i <= 15; i++) {
    const y = (canvas.height / 15) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  
  ctx.fillStyle = '#666666';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('等待加载 DXF 文件...', canvas.width / 2, canvas.height / 2);
  
  loadingEl.style.display = 'none';
  fileInfoEl.textContent = '就绪 - 等待选择文件';
  fileInfoEl.style.display = 'block';
}

function loadDxfFile(filePath) {
  loadingEl.textContent = '正在加载 DXF 文件...';
  loadingEl.style.display = 'block';
  errorEl.style.display = 'none';
  fileInfoEl.style.display = 'none';
  
  const xhr = new XMLHttpRequest();
  xhr.open('GET', filePath, true);
  xhr.responseType = 'text';
  
  xhr.onload = function() {
    if (xhr.status === 200 || xhr.status === 0) {
      const dxfContent = xhr.responseText;
      parseAndRenderDxf(dxfContent, filePath);
    } else {
      showError('加载文件失败: ' + xhr.status);
    }
  };
  
  xhr.onerror = function() {
    showError('无法读取文件');
  };
  
  xhr.send();
}

function parseAndRenderDxf(content, filePath) {
  const lines = content.split('\n');
  const entities = [];
  let currentEntity = null;
  let inEntities = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === 'ENTITIES') {
      inEntities = true;
      continue;
    }
    
    if (line === 'ENDSEC') {
      if (inEntities) break;
      continue;
    }
    
    if (!inEntities) continue;
    
    if (line === 'LINE') {
      currentEntity = { type: 'LINE', points: [] };
      entities.push(currentEntity);
    } else if (line === 'LWPOLYLINE') {
      currentEntity = { type: 'LWPOLYLINE', points: [] };
      entities.push(currentEntity);
    } else if (line === 'CIRCLE') {
      currentEntity = { type: 'CIRCLE', center: [], radius: 0 };
      entities.push(currentEntity);
    } else if (line === 'TEXT') {
      currentEntity = { type: 'TEXT', point: [], value: '', height: 0 };
      entities.push(currentEntity);
    }
    
    if (currentEntity) {
      if (line === '10') {
        const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
        if (currentEntity.type === 'LINE' && currentEntity.points.length < 2) {
          currentEntity.points.push({ x: parseFloat(nextLine), y: 0 });
        } else if (currentEntity.type === 'LWPOLYLINE') {
          currentEntity.points.push({ x: parseFloat(nextLine), y: 0 });
        } else if (currentEntity.type === 'CIRCLE') {
          currentEntity.center.push(parseFloat(nextLine));
        } else if (currentEntity.type === 'TEXT') {
          currentEntity.point.push(parseFloat(nextLine));
        }
      } else if (line === '20') {
        const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
        if (currentEntity.type === 'LINE' && currentEntity.points.length > 0) {
          currentEntity.points[currentEntity.points.length - 1].y = parseFloat(nextLine);
        } else if (currentEntity.type === 'LWPOLYLINE' && currentEntity.points.length > 0) {
          currentEntity.points[currentEntity.points.length - 1].y = parseFloat(nextLine);
        } else if (currentEntity.type === 'CIRCLE') {
          currentEntity.center.push(parseFloat(nextLine));
        } else if (currentEntity.type === 'TEXT') {
          currentEntity.point.push(parseFloat(nextLine));
        }
      } else if (line === '30') {
        const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
        if (currentEntity.type === 'CIRCLE') {
          currentEntity.center.push(parseFloat(nextLine));
        } else if (currentEntity.type === 'TEXT') {
          currentEntity.point.push(parseFloat(nextLine));
        }
      } else if (line === '40') {
        const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
        if (currentEntity.type === 'CIRCLE') {
          currentEntity.radius = parseFloat(nextLine);
        } else if (currentEntity.type === 'TEXT') {
          currentEntity.height = parseFloat(nextLine);
        }
      } else if (line === '1') {
        const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
        if (currentEntity.type === 'TEXT') {
          currentEntity.value = nextLine;
        }
      }
    }
  }
  
  renderEntities(entities, filePath);
}

function renderEntities(entities, filePath) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 20; i++) {
    const x = (canvas.width / 20) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i <= 15; i++) {
    const y = (canvas.height / 15) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  
  if (entities.length === 0) {
    ctx.fillStyle = '#ff0000';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('未找到可识别的图形实体', canvas.width / 2, canvas.height / 2);
    loadingEl.style.display = 'none';
    fileInfoEl.textContent = `文件: ${filePath} - 空内容`;
    fileInfoEl.style.display = 'block';
    return;
  }
  
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  entities.forEach(entity => {
    if (entity.type === 'LINE' && entity.points.length >= 2) {
      entity.points.forEach(p => {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      });
    } else if (entity.type === 'LWPOLYLINE') {
      entity.points.forEach(p => {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      });
    } else if (entity.type === 'CIRCLE') {
      minX = Math.min(minX, entity.center[0] - entity.radius);
      maxX = Math.max(maxX, entity.center[0] + entity.radius);
      minY = Math.min(minY, entity.center[1] - entity.radius);
      maxY = Math.max(maxY, entity.center[1] + entity.radius);
    }
  });
  
  const padding = 50;
  const scaleX = (canvas.width - padding * 2) / (maxX - minX || 1);
  const scaleY = (canvas.height - padding * 2) / (maxY - minY || 1);
  const scale = Math.min(scaleX, scaleY);
  
  const offsetX = canvas.width / 2 - ((minX + maxX) / 2) * scale;
  const offsetY = canvas.height / 2 + ((minY + maxY) / 2) * scale;
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  
  entities.forEach(entity => {
    if (entity.type === 'LINE' && entity.points.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(entity.points[0].x * scale + offsetX, -entity.points[0].y * scale + offsetY);
      ctx.lineTo(entity.points[1].x * scale + offsetX, -entity.points[1].y * scale + offsetY);
      ctx.stroke();
    } else if (entity.type === 'LWPOLYLINE' && entity.points.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(entity.points[0].x * scale + offsetX, -entity.points[0].y * scale + offsetY);
      for (let i = 1; i < entity.points.length; i++) {
        ctx.lineTo(entity.points[i].x * scale + offsetX, -entity.points[i].y * scale + offsetY);
      }
      ctx.stroke();
    } else if (entity.type === 'CIRCLE') {
      ctx.beginPath();
      ctx.arc(entity.center[0] * scale + offsetX, -entity.center[1] * scale + offsetY, entity.radius * scale, 0, Math.PI * 2);
      ctx.stroke();
    } else if (entity.type === 'TEXT') {
      ctx.fillStyle = '#000000';
      ctx.font = `${entity.height * scale}px sans-serif`;
      ctx.fillText(entity.value, entity.point[0] * scale + offsetX, -entity.point[1] * scale + offsetY);
    }
  });
  
  loadingEl.style.display = 'none';
  fileInfoEl.textContent = `文件: ${filePath} - ${entities.length} 个实体`;
  fileInfoEl.style.display = 'block';
}

function showError(msg) {
  loadingEl.style.display = 'none';
  errorEl.textContent = '错误: ' + msg;
  errorEl.style.display = 'block';
}
