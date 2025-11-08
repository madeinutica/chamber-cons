// Test script for semantic search API
// Run with: node test-semantic-search.js

async function testSemanticSearch() {
  const testQueries = [
    "I need a lawyer",
    "veteran owned restaurant",
    "woman owned boutique near me",
    "where can I get my car fixed",
    "nonprofit helping homeless",
    "find a dentist",
    "local coffee shop",
    "minority owned business"
  ]

  console.log('Testing Semantic Search API\n')
  console.log('='.repeat(50))

  for (const query of testQueries) {
    try {
      console.log(`\nQuery: "${query}"`)
      
      const response = await fetch('http://localhost:3000/api/semantic-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      })

      if (!response.ok) {
        console.error(`❌ Failed: ${response.status} ${response.statusText}`)
        continue
      }

      const result = await response.json()
      console.log('✅ Result:')
      console.log(`   Categories: ${result.categories.join(', ') || 'none'}`)
      console.log(`   Designations: ${result.designations.join(', ') || 'none'}`)
      console.log(`   Intent: ${result.intent}`)
      console.log(`   Confidence: ${(result.confidence * 100).toFixed(0)}%`)
    } catch (error) {
      console.error(`❌ Error: ${error.message}`)
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('Testing complete!\n')
}

// Run the test
testSemanticSearch().catch(console.error)
