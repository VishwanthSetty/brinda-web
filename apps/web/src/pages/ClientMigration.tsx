import { useState } from 'react'
import * as XLSX from 'xlsx'
import { clientsApi } from '../services/api'
import './ClientMigration.css'

interface MigrationResult {
    total_processed: number
    created_count: number
    updated_count: number
    errors: string[]
}

export default function ClientMigration() {
    const [file, setFile] = useState<File | null>(null)
    const [previewData, setPreviewData] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<MigrationResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            setError(null)
            setResult(null)
            parseFile(selectedFile)
        }
    }

    const parseFile = (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = e.target?.result
                const workbook = XLSX.read(data, { type: 'binary' })
                const sheetName = workbook.SheetNames[0]
                const sheet = workbook.Sheets[sheetName]
                const jsonData = XLSX.utils.sheet_to_json(sheet)
                setPreviewData(jsonData.slice(0, 5)) // Preview first 5 rows
            } catch (err) {
                setError('Failed to parse file. Please ensure it is a valid Excel file.')
                console.error(err)
            }
        }
        reader.readAsBinaryString(file)
    }

    const handleUpload = async () => {
        if (!file) return

        setIsLoading(true)
        setError(null)
        setResult(null)

        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                const data = e.target?.result
                const workbook = XLSX.read(data, { type: 'binary' })
                const sheetName = workbook.SheetNames[0]
                const sheet = workbook.Sheets[sheetName]
                const jsonData = XLSX.utils.sheet_to_json(sheet)

                const response = await clientsApi.migrateClients(jsonData)
                setResult(response)
            } catch (err: any) {
                setError(err.message || 'Migration failed. Please try again.')
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }
        reader.readAsBinaryString(file)
    }

    return (
        <div className="migration-container">
            <h2 className="page-title">Client Data Migration</h2>
            <p className="page-description">
                Upload an Excel file (.xlsx, .xls) to update or create client records.
                <br />
                Files must contain headers matching the database schema (e.g., "Client Name (*)", "ID").
            </p>

            <div className="upload-section">
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    className="file-input"
                    disabled={isLoading}
                />
                <button
                    onClick={handleUpload}
                    disabled={!file || isLoading}
                    className="upload-btn"
                >
                    {isLoading ? 'Processing...' : 'Migrate Clients'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {result && (
                <div className="result-section">
                    <h3>Migration Results</h3>
                    <div className="result-stats">
                        <div className="stat-card">
                            <span className="stat-value">{result.total_processed}</span>
                            <span className="stat-label">Total Processed</span>
                        </div>
                        <div className="stat-card success">
                            <span className="stat-value">{result.created_count}</span>
                            <span className="stat-label">Created</span>
                        </div>
                        <div className="stat-card info">
                            <span className="stat-value">{result.updated_count}</span>
                            <span className="stat-label">Updated</span>
                        </div>
                    </div>

                    {result.errors.length > 0 && (
                        <div className="error-list">
                            <h4>Errors ({result.errors.length})</h4>
                            <ul>
                                {result.errors.map((err, index) => (
                                    <li key={index}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {previewData.length > 0 && !result && (
                <div className="preview-section">
                    <h3>File Preview (First 5 Rows)</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    {Object.keys(previewData[0]).map((key) => (
                                        <th key={key}>{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.map((row, index) => (
                                    <tr key={index}>
                                        {Object.values(row).map((val: any, i) => (
                                            <td key={i}>{String(val)}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
