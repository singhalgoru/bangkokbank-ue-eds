/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

function readJson(absPath) {
  return JSON.parse(fs.readFileSync(absPath, 'utf8'));
}

function writeJson(absPath, data) {
  fs.writeFileSync(absPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function mapField(field, { nameMap = {}, labelMap = {} } = {}) {
  const next = { ...field };
  if (typeof next.name === 'string' && nameMap[next.name]) next.name = nameMap[next.name];
  if (typeof next.label === 'string' && labelMap[next.label]) next.label = labelMap[next.label];
  return next;
}

function injectFieldsIntoModel({ componentModels, targetModelId, fields }) {
  const target = componentModels.find((m) => m.id === targetModelId);
  if (!target) throw new Error(`Target model not found in component-models.json: ${targetModelId}`);

  const injectedNames = new Set(fields.map((f) => f.name));
  target.fields = (target.fields || []).filter((f) => !injectedNames.has(f.name));
  target.fields.push(...fields);
}

function main() {
  const root = process.cwd();
  const configPath = path.join(root, 'scripts', 'inject-model-fields.config.json');
  const outPath = path.join(root, 'component-models.json');

  const config = readJson(configPath);
  const componentModels = readJson(outPath);

  (config.sources || []).forEach((source) => {
    const sourceAbs = path.join(root, source.sourceFile);
    const sourceJson = readJson(sourceAbs);
    const sourceModel = (sourceJson.models || []).find((m) => m.id === source.sourceModelId);
    if (!sourceModel) throw new Error(`Source model not found: ${source.sourceModelId} in ${source.sourceFile}`);

    (source.targets || []).forEach((t) => {
      const mappedFields = (sourceModel.fields || []).map((f) => mapField(f, t));
      injectFieldsIntoModel({
        componentModels,
        targetModelId: t.targetModelId,
        fields: mappedFields,
      });
    });
  });

  writeJson(outPath, componentModels);
  console.log('Injected model fields into component-models.json');
}

main();
