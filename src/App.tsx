import { useState } from 'react'
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function App() {
  const [symptoms, setSymptoms] = useState<string>('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)
      const symptomsList = symptoms.split(',').map(s => s.trim().toLowerCase())
      
      console.log('Sending symptoms:', symptomsList)
      console.log('API URL:', import.meta.env.VITE_API_URL)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: symptomsList }),
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        throw new Error(`Failed to get prediction: ${errorText}`)
      }

      const data = await response.json()
      console.log('API Response:', data)
      setResult(data)
    } catch (err) {
      console.error('Error details:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while connecting to the server')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (symptoms.trim() && !loading) {
        handleSubmit()
      }
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
            AI Medical Diagnosis System
          </Typography>
          
          <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
            Enter your symptoms below, separated by commas (e.g., fever, headache, cough)
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ mb: 3 }}
            placeholder="Type your symptoms here..."
          />

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading || !symptoms.trim()}
              size="large"
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Get Diagnosis'}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {result && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Diagnosis Results:
              </Typography>
              
              <List>
                {result.top_3_predictions.map((pred: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${index + 1}. ${pred.disease}`}
                      secondary={`Probability: ${(pred.probability * 100).toFixed(2)}%`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  )
}

export default App
