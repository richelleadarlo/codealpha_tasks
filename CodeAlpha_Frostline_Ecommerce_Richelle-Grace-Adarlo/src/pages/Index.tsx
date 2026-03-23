import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImg from '@/assets/hero-landing.jpg';
import secondaryImg from '@/assets/hero-secondary.jpg';
import collectionImg from '@/assets/hero-collection.jpg';
import electronicsImg from '@/assets/electronics.jpg';
import homeFurnitureImg from '@/assets/home-furniture.jpg';

const CATEGORIES = [
  'ELECTRONICS', 'CLOTHING', 'BOOKS', 'HOME', 'ACCESSORIES', 'NEW ARRIVALS'
];

export default function Index() {
  return (
    <div className="min-h-screen bg-foreground text-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative h-[85vh] min-h-[600px]">
          <img
            src={heroImg}
            alt="FROSTLINE Collection"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-16 sm:px-12 lg:px-20">
            <h1 className="font-heading text-6xl font-bold uppercase leading-[0.9] tracking-tighter text-white sm:text-8xl lg:text-[10rem]">
              FROST<br />LINE
            </h1>
            <p className="mt-4 max-w-md text-lg text-white/70">
              Premium products crafted for every lifestyle. Discover what's next.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/login">
                <Button size="lg" className="rounded-full bg-white px-8 text-black hover:bg-white/90">
                  Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="rounded-full border-white bg-white/10 px-8 text-accent backdrop-blur-sm hover:bg-white/20">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling Categories Marquee */}
      <section className="overflow-hidden border-y border-white/10 bg-black py-4">
        <div className="animate-marquee flex whitespace-nowrap">
          {[...CATEGORIES, ...CATEGORIES, ...CATEGORIES].map((cat, i) => (
            <span key={i} className="mx-6 font-heading text-sm font-bold uppercase tracking-widest text-white/60">
              {cat} <span className="mx-4 text-accent">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* Two-column Editorial */}
      <section className="mx-auto grid max-w-7xl gap-0 md:grid-cols-2">
        <div className="flex flex-col justify-center px-8 py-16 sm:px-12 lg:px-20">
          <span className="mb-4 font-heading text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Behind the brand
          </span>
          <h2 className="font-heading text-4xl font-bold uppercase leading-tight tracking-tight text-white sm:text-5xl">
            GET READY TO{' '}
            <span className="text-accent">REFRESH</span> YOUR WARDROBE
          </h2>
          <p className="mt-6 text-base leading-relaxed text-white/50">
            From cutting-edge electronics to handpicked home essentials, 
            FROSTLINE curates only the best. Sign up to explore our full 
            collection and get exclusive member-only pricing.
          </p>
          <Link to="/register" className="mt-8 inline-block">
            <Button className="rounded-full bg-accent px-8 text-accent-foreground hover:bg-accent/90">
              Join Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="relative min-h-[400px] overflow-hidden">
          <img
            src={secondaryImg}
            alt="Style editorial"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </section>

      {/* Features Row */}
      <section className="border-y border-white/10 bg-black/50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
            { icon: Shield, title: 'Secure Checkout', desc: 'Protected payments' },
            { icon: Star, title: 'Premium Quality', desc: 'Curated products only' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 px-8 py-8">
              <Icon className="h-8 w-8 flex-shrink-0 text-accent" />
              <div>
                <p className="font-heading text-sm font-bold uppercase text-white">{title}</p>
                <p className="text-sm text-white/50">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Best Collections Section */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-12">
        <div className="mb-12 text-center">
          <span className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-accent">
            ✦ Explore
          </span>
          <h2 className="mt-3 font-heading text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl">
            BEST COLLECTIONS
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {['Electronics', 'Clothing', 'Home'].map((cat, i) => (
            <div key={cat} className="group relative overflow-hidden rounded-xl">
              <img
                src={i === 0 ? electronicsImg : i === 1 ? secondaryImg : homeFurnitureImg}
                alt={cat}
                className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <p className="font-heading text-lg font-bold uppercase text-white">{cat}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Big CTA */}
      <section className="border-t border-white/10 bg-black px-6 py-24 text-center">
        <Sparkles className="mx-auto mb-6 h-8 w-8 text-accent" />
        <h2 className="font-heading text-4xl font-bold uppercase tracking-tight text-white sm:text-6xl">
          WHEN OUR STORIES ARE BETTER,<br />
          <span className="text-accent">SO IS OUR WORLD.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-white/50">
          Create your account to unlock the full collection, exclusive deals, and member-only perks.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/register">
            <Button size="lg" className="rounded-full bg-white px-10 text-black hover:bg-white/90">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="rounded-full border-white bg-black px-10 text-accent hover:bg-black/80">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="font-heading text-lg font-bold tracking-tight text-white">FROSTLINE</span>
          <p className="text-sm text-white/40">© 2026 FROSTLINE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
