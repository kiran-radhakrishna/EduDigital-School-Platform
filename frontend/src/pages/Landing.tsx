import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import Features from '../components/landing/Features'
import Statistics from '../components/landing/Statistics'
import Testimonials from '../components/landing/Testimonials'
import Footer from '../components/landing/Footer'

function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Statistics />
      <Testimonials />
      <Footer />
    </div>
  )
}

export default Landing
