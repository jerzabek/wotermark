import { VStack } from '@shadow-panda/styled-system/jsx'

import { HomePage } from '@/pages/home'
import { ThemeProvider, WatermarkProvider } from '@/shared/context'
import { Footer } from '@/widgets/footer'
import { Navbar } from '@/widgets/navbar'

function App() {
  return (
    <ThemeProvider>
      <WatermarkProvider>
        <Navbar />

        <VStack gap="0" minH="100vh" bg="gray.50" _dark={{ bg: 'gray.950' }}>
          <HomePage />
        </VStack>

        <Footer />
      </WatermarkProvider>
    </ThemeProvider>
  )
}

export default App
