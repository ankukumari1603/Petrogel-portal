import { Alert, Customer, CustomerRequirement, Formulation, Inventory, LabTest, Production, Product, QCRecord } from '../models/index.js'

const resources = {
  customers: { model: Customer, idField: 'customerId', aliases: { companyName: 'company', createdAt: 'created' } },
  products: { model: Product, idField: 'productId' },
  formulations: { model: Formulation, idField: 'formulationId', aliases: { rawMaterials: 'materials', targetSpecification: 'specification', updatedAt: 'updated' } },
  production: { model: Production, idField: 'productionId', aliases: { batchNumber: 'batch', plannedQuantity: 'planned', producedQuantity: 'produced', operator: 'operator' } },
  qc: { model: QCRecord, idField: 'qcId', aliases: { batchNumber: 'batch', actualReading: 'actual', minimum: 'minimum', maximum: 'maximum', testedBy: 'testedBy', testDate: 'testDate' } },
  lab: { model: LabTest, idField: 'sampleId', aliases: { batchNumber: 'batch', labLocation: 'location', testParameter: 'parameter', updatedAt: 'updated' } },
  inventory: { model: Inventory, idField: 'itemId', aliases: { itemName: 'name', currentStock: 'current', minimumStock: 'minimum', maximumStock: 'maximum', stockStatus: 'stockStatus', updatedAt: 'updated' } },
  requirements: { model: CustomerRequirement, idField: 'requirementId', aliases: { requiredParameters: 'parameters', requestedQuantity: 'quantity', dueDate: 'dueDate', assignedPerson: 'assigned' } },
  alerts: { model: Alert, idField: '_id', aliases: { relatedId: 'related', createdAt: 'date' } },
}

const inventoryStatus = (item) => item.currentStock < item.minimumStock ? 'LOW STOCK' : item.currentStock > item.maximumStock ? 'OVERSTOCK' : 'NORMAL'
const getConfig = (resource) => resources[resource]

function toClient(document, config) {
  const raw = document.toObject ? document.toObject() : document
  const output = { ...raw, id: raw[config.idField] || raw._id.toString() }
  Object.entries(config.aliases || {}).forEach(([source, target]) => { if (raw[source] !== undefined) output[target] = raw[source] })
  if (config.idField === 'qcId') Object.assign(output, { minimum: raw.parameters?.minimum ?? '', maximum: raw.parameters?.maximum ?? '', actual: raw.parameters?.actual ?? '', unit: raw.parameters?.unit ?? '', parameter: raw.parameters?.parameter ?? '' })
  if (config.idField === 'itemId') output.stockStatus = inventoryStatus(raw)
  if (config.idField !== '_id') delete output[config.idField]
  delete output._id
  return output
}

function toDatabase(resource, payload) {
  const config = getConfig(resource)
  const body = { ...payload }
  if (payload.id && config.idField !== '_id') body[config.idField] = payload.id
  if (resource === 'customers') { body.companyName = payload.company ?? payload.companyName; delete body.company }
  if (resource === 'products') { body.name = payload.name }
  if (resource === 'formulations') { body.rawMaterials = payload.materials ?? payload.rawMaterials; body.targetSpecification = payload.specification ?? payload.targetSpecification; delete body.materials; delete body.specification }
  if (resource === 'production') { body.batchNumber = payload.batch ?? payload.batchNumber; body.plannedQuantity = payload.planned ?? payload.plannedQuantity; body.producedQuantity = payload.produced ?? payload.producedQuantity; delete body.batch; delete body.planned; delete body.produced }
  if (resource === 'qc') { body.batchNumber = payload.batch ?? payload.batchNumber; body.testDate = payload.testDate || payload.date; body.parameters = { minimum: payload.minimum, maximum: payload.maximum, actual: payload.actual, unit: payload.unit, parameter: payload.parameter }; delete body.batch; delete body.minimum; delete body.maximum; delete body.actual; }
  if (resource === 'lab') { body.batchNumber = payload.batch ?? payload.batchNumber; body.labLocation = payload.location ?? payload.labLocation; body.testParameter = payload.parameter ?? payload.testParameter; delete body.batch; delete body.location; delete body.parameter }
  if (resource === 'inventory') { body.itemName = payload.name ?? payload.itemName; body.currentStock = Number(payload.current ?? payload.currentStock ?? 0); body.minimumStock = Number(payload.minimum ?? payload.minimumStock ?? 0); body.maximumStock = Number(payload.maximum ?? payload.maximumStock ?? 0); delete body.name; delete body.current; delete body.minimum; delete body.maximum; body.stockStatus = inventoryStatus(body) }
  if (resource === 'requirements') { body.requiredParameters = payload.parameters ?? payload.requiredParameters; body.requestedQuantity = payload.quantity ?? payload.requestedQuantity; body.assignedPerson = payload.assigned ?? payload.assignedPerson; delete body.parameters; delete body.quantity; delete body.assigned }
  if (resource === 'alerts') { body.relatedId = payload.related ?? payload.relatedId; delete body.related }
  delete body.id
  return body
}

export async function list(resource, req, res, next) { try { const config = getConfig(resource); const documents = await config.model.find().sort({ createdAt: -1 }); res.json(documents.map((document) => toClient(document, config))) } catch (error) { next(error) } }
export async function create(resource, req, res, next) { try { const config = getConfig(resource); const body = toDatabase(resource, req.body); const document = await config.model.create(body); res.status(201).json(toClient(document, config)) } catch (error) { next(error) } }
export async function getOne(resource, req, res, next) { try { const config = getConfig(resource); const document = config.idField === '_id' ? await config.model.findById(req.params.id) : await config.model.findOne({ [config.idField]: req.params.id }); if (!document) return res.status(404).json({ message: 'Record not found' }); res.json(toClient(document, config)) } catch (error) { next(error) } }
export async function update(resource, req, res, next) { try { const config = getConfig(resource); const body = toDatabase(resource, req.body); const query = config.idField === '_id' ? { _id: req.params.id } : { [config.idField]: req.params.id }; const document = await config.model.findOneAndUpdate(query, body, { new: true, runValidators: true }); if (!document) return res.status(404).json({ message: 'Record not found' }); res.json(toClient(document, config)) } catch (error) { next(error) } }
export async function remove(resource, req, res, next) { try { const config = getConfig(resource); const query = config.idField === '_id' ? { _id: req.params.id } : { [config.idField]: req.params.id }; const document = await config.model.findOneAndDelete(query); if (!document) return res.status(404).json({ message: 'Record not found' }); res.json({ id: req.params.id, message: 'Record deleted' }) } catch (error) { next(error) } }

export async function dashboard(req, res, next) { try { const [customers, production, qc, inventory, requirements, alerts] = await Promise.all([Customer.countDocuments(), Production.find(), QCRecord.find(), Inventory.find(), CustomerRequirement.find(), Alert.countDocuments({ status: 'Open' })]); res.json({ totalCustomers: customers, totalProductionBatches: production.length, completedBatches: production.filter((item) => item.status === 'Completed').length, pendingQc: qc.filter((item) => item.result === 'PENDING').length, failedQc: qc.filter((item) => item.result === 'FAIL').length, lowStockItems: inventory.filter((item) => item.currentStock < item.minimumStock).length, pendingRequirements: requirements.filter((item) => !['Completed', 'Approved', 'Rejected'].includes(item.status)).length, openAlerts: alerts }) } catch (error) { next(error) } }
