import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, LogOut, Menu, X, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const getNavbarStyle = (pathname: string) => {
  const darkPaths = ['/', '/login', '/register', '/shop', '/cart', '/checkout', '/orders'];
  const darkPrefixes = ['/product/'];

  const isDarkBg =
    darkPaths.includes(pathname) || darkPrefixes.some(prefix => pathname.startsWith(prefix));

  if (isDarkBg) {
    return {
      nav: 'bg-black/20 backdrop-blur-xl',
      text: 'text-white',
      textMuted: 'text-white/70',
      textHover: 'hover:text-white',
      border: 'border-white/10',
      mobileMenu: 'bg-black/40 backdrop-blur-lg',
    };
  }

  return {
    nav: 'bg-white/25 backdrop-blur-xl border border-slate-900/10',
    text: 'text-slate-950',
    textMuted: 'text-slate-950/70',
    textHover: 'hover:text-slate-950',
    border: 'border-slate-900/10',
    mobileMenu: 'bg-sky-50/50 backdrop-blur-lg',
  };
};

export default function Navbar() {
  const { isAuthenticated, profile, logout } = useAuth();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navStyle = getNavbarStyle(location.pathname);

  return (
    <nav className={`sticky top-0 z-50 ${navStyle.nav}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className={`font-heading text-xl font-bold tracking-tight ${navStyle.text}`}>
          FROSTLINE
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            to="/shop"
            className={`text-sm font-medium transition-colors ${navStyle.textMuted} ${navStyle.textHover}`}
          >
            Shop
          </Link>
          {isAuthenticated && (
            <Link
              to="/orders"
              className={`text-sm font-medium transition-colors ${navStyle.textMuted} ${navStyle.textHover}`}
            >
              <span className="flex items-center gap-1.5">
                <Package className="h-4 w-4" /> Orders
              </span>
            </Link>
          )}
          <Link
            to="/cart"
            className={`relative transition-colors ${navStyle.textMuted} ${navStyle.textHover}`}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {totalItems}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${navStyle.text}`}>
                Hi, {profile?.name?.split(' ')[0] ?? 'User'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className={`${navStyle.textMuted} ${navStyle.textHover}`}
              >
                <LogOut className="mr-1.5 h-4 w-4" /> Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${navStyle.textMuted} ${navStyle.textHover}`}
                >
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          )}
        </div>

        <button className={`md:hidden ${navStyle.text}`} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className={`border-t px-4 pb-4 pt-2 md:hidden ${navStyle.border} ${navStyle.mobileMenu}`}>
          <div className="flex flex-col gap-3">
            <Link
              to="/shop"
              onClick={() => setMenuOpen(false)}
              className={`py-2 text-sm font-medium ${navStyle.textMuted}`}
            >
              Shop
            </Link>
            <Link
              to="/cart"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 py-2 text-sm font-medium ${navStyle.textMuted}`}
            >
              Cart
              {totalItems > 0 && (
                <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] text-destructive-foreground">
                  {totalItems}
                </span>
              )}
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
                onClick={() => setMenuOpen(false)}
                className={`py-2 text-sm font-medium ${navStyle.textMuted}`}
              >
                Orders
              </Link>
            )}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="py-2 text-left text-sm font-medium text-destructive"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className={`py-2 text-sm font-medium ${navStyle.textMuted}`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className={`py-2 text-sm font-medium ${navStyle.textMuted}`}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
