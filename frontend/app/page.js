"use client";

import { useEffect, useState } from "react";
import CinematicVideoBackground from "../components/CinematicVideoBackground";

const DJANGO_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const sections = [
  {
    id: "vehicles",
    number: "01",
    label: "VEHICLES",
    title: "Explore the machines.",
    description:
      "Discover performance, design and technology.",
    route: "/vehicles/",
  },

  {
    id: "services",
    number: "02",
    label: "SERVICES",
    title: "Service without compromise.",
    description:
      "Keep your vehicle performing at its best.",
    route: "/services/",
  },

  {
    id: "parts",
    number: "03",
    label: "PARTS",
    title: "Understand what moves you.",
    description:
      "Explore the components behind the machine.",
    route: "/store/?category=Parts",
  },

  {
    id: "accessories",
    number: "04",
    label: "ACCESSORIES",
    title: "Build your version.",
    description:
      "Customize your vehicle around the way you drive.",
    route: "/store/?category=Accessories",
  },
];

export default function Home() {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  /* =====================================================
     AUTHENTICATION STATE
  ===================================================== */

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const auth = params.get("auth");
    const loggedOut = params.get("logged_out");

    /*
     * Successful Django login/register.
     */
    if (auth === "1") {
      sessionStorage.setItem(
        "carcraft_authenticated",
        "true"
      );

      setIsAuthenticated(true);

      /*
       * Remove ?auth=1 from the visible URL.
       */
      window.history.replaceState(
        {},
        document.title,
        "/"
      );

      return;
    }

    /*
     * Successful logout.
     */
    if (loggedOut === "1") {
      sessionStorage.removeItem(
        "carcraft_authenticated"
      );

      setIsAuthenticated(false);

      /*
       * Remove ?logged_out=1 from the visible URL.
       */
      window.history.replaceState(
        {},
        document.title,
        "/"
      );

      return;
    }

    /*
     * Restore authentication state when the user
     * refreshes the homepage.
     */
    const storedAuth =
      sessionStorage.getItem(
        "carcraft_authenticated"
      );

    setIsAuthenticated(
      storedAuth === "true"
    );
  }, []);

  /* =====================================================
     SCROLL TRACKING
  ===================================================== */

  useEffect(() => {
    let animationFrame = null;

    const handleScroll = () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      animationFrame = requestAnimationFrame(() => {
        const maxScroll =
          document.documentElement.scrollHeight -
          window.innerHeight;

        const currentProgress =
          maxScroll > 0
            ? window.scrollY / maxScroll
            : 0;

        const clampedProgress = Math.max(
          0,
          Math.min(1, currentProgress)
        );

        setProgress(clampedProgress);

        const sectionIndex = Math.min(
          sections.length - 1,
          Math.round(
            clampedProgress *
              (sections.length - 1)
          )
        );

        setActiveSection(sectionIndex);
      });
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    handleScroll();

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  /* =====================================================
     SECTION NAVIGATION
  ===================================================== */

  const scrollToSection = (index) => {
    const element = document.getElementById(
      sections[index].id
    );

    if (!element) return;

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /* =====================================================
     DJANGO NAVIGATION
  ===================================================== */

  const goToDjango = (route) => {
    if (!route) return;

    window.location.href =
      `${DJANGO_URL}${route}`;
  };

  /* =====================================================
     SEARCH
  ===================================================== */

  const openSearch = () => {
    setSearchOpen(true);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      return;
    }

    window.location.href =
      `${DJANGO_URL}/vehicles/?search=${encodeURIComponent(
        query
      )}`;
  };

  /* =====================================================
     LOGIN
  ===================================================== */

  const handleLogin = () => {
    window.location.href =
      `${DJANGO_URL}/accounts/login/`;
  };

  /* =====================================================
     SIGN UP
  ===================================================== */

  const handleSignup = () => {
    window.location.href =
      `${DJANGO_URL}/accounts/register/`;
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    /*
     * Clear the frontend state immediately.
     */
    sessionStorage.removeItem(
      "carcraft_authenticated"
    );

    /*
     * Let Django destroy the actual authentication
     * session and then redirect back to CarCraft.
     */
    window.location.href =
      `${DJANGO_URL}/accounts/logout/`;
  };

  /* =====================================================
     ACCOUNT
  ===================================================== */

  const handleAccount = () => {
    window.location.href =
      `${DJANGO_URL}/orders/`;
  };

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <main className="carcraft-page">

      {/* =================================================
          CINEMATIC VIDEO
      ================================================= */}

      <CinematicVideoBackground
        progress={progress}
      />

      {/* =================================================
          UI
      ================================================= */}

      <div className="carcraft-ui">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <header className="carcraft-topbar">

          <button
            type="button"
            className="carcraft-brand"
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
          >
            CARCRAFT
          </button>

          <div className="carcraft-actions">

            {/* SEARCH */}

            <button
              type="button"
              className="carcraft-search"
              onClick={openSearch}
            >
              <span className="search-icon">
                ⌕
              </span>

              Search
            </button>

            {/* =================================================
                AUTHENTICATED USER
            ================================================= */}

            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  className="carcraft-auth"
                  onClick={handleAccount}
                >
                  Account
                </button>

                <button
                  type="button"
                  className="carcraft-signup"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (

              /* =================================================
                 GUEST USER
              ================================================= */

              <>
                <button
                  type="button"
                  className="carcraft-auth"
                  onClick={handleLogin}
                >
                  Login
                </button>

                <button
                  type="button"
                  className="carcraft-signup"
                  onClick={handleSignup}
                >
                  Sign Up
                </button>
              </>
            )}

          </div>

        </header>

        {/* =================================================
            SEARCH MODAL
        ================================================= */}

        {searchOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background:
                "rgba(0, 0, 0, 0.82)",
              backdropFilter:
                "blur(14px)",
              WebkitBackdropFilter:
                "blur(14px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
            }}
            onClick={closeSearch}
          >

            <div
              style={{
                width: "min(700px, 100%)",
                background:
                  "rgba(15, 15, 15, 0.96)",
                border:
                  "1px solid rgba(255,255,255,0.18)",
                padding: "40px",
                position: "relative",
                boxShadow:
                  "0 30px 100px rgba(0,0,0,0.6)",
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {/* CLOSE */}

              <button
                type="button"
                onClick={closeSearch}
                style={{
                  position: "absolute",
                  top: "18px",
                  right: "20px",
                  border: "none",
                  background: "transparent",
                  color: "#fff",
                  fontSize: "30px",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ×
              </button>

              {/* LABEL */}

              <div
                style={{
                  color:
                    "rgba(255,255,255,0.55)",
                  fontSize: "11px",
                  letterSpacing: "0.2em",
                  marginBottom: "18px",
                }}
              >
                SEARCH VEHICLES
              </div>

              {/* FORM */}

              <form
                onSubmit={handleSearch}
                style={{
                  display: "flex",
                  gap: "12px",
                }}
              >

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search by brand or model..."
                  autoFocus
                  style={{
                    flex: 1,
                    minWidth: 0,
                    height: "56px",
                    padding:
                      "0 18px",
                    background:
                      "rgba(255,255,255,0.08)",
                    border:
                      "1px solid rgba(255,255,255,0.2)",
                    color: "#fff",
                    outline: "none",
                    fontSize: "16px",
                  }}
                />

                <button
                  type="submit"
                  style={{
                    height: "56px",
                    padding:
                      "0 28px",
                    border: "none",
                    background: "#fff",
                    color: "#000",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    letterSpacing:
                      "0.08em",
                  }}
                >
                  SEARCH
                </button>

              </form>

              {/* HINT */}

              <div
                style={{
                  marginTop: "18px",
                  color:
                    "rgba(255,255,255,0.4)",
                  fontSize: "12px",
                }}
              >
                Try searching for Toyota,
                Hyundai, Tata, Mahindra
                or a specific model.
              </div>

            </div>

          </div>
        )}

        {/* =================================================
            LEFT NAVIGATION
        ================================================= */}

        <nav className="carcraft-nav">

          <div className="nav-label">
            EXPLORE
          </div>

          {sections.map(
            (section, index) => (
              <button
                key={section.id}
                type="button"
                className={`carcraft-nav-item ${
                  activeSection === index
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  scrollToSection(index)
                }
              >

                <span className="nav-number">
                  {section.number}
                </span>

                <span>
                  {section.label}
                </span>

              </button>
            )
          )}

        </nav>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="carcraft-content">

          {sections.map(
            (section, index) => (
              <section
                id={section.id}
                key={section.id}
                className={`carcraft-section ${
                  activeSection === index
                    ? "active"
                    : ""
                }`}
              >

                <div className="section-content">

                  <div className="section-number">
                    {section.number}
                  </div>

                  <div className="section-label">
                    {section.label}
                  </div>

                  <h2>
                    {section.title}
                  </h2>

                  <p>
                    {section.description}
                  </p>

                  {/* =================================================
                      EXPLORE
                  ================================================= */}

                  <button
                    type="button"
                    className="section-action"
                    onClick={() => {

                      if (section.route) {
                        goToDjango(
                          section.route
                        );
                      } else {
                        scrollToSection(
                          index
                        );
                      }

                    }}
                  >

                    Explore

                    <span>
                      ↗
                    </span>

                  </button>

                </div>

              </section>
            )
          )}

        </div>

        {/* =================================================
            SCROLL INDICATOR
        ================================================= */}

        <div className="carcraft-bottom-left">

          <span className="scroll-line" />

          <span>
            SCROLL TO EXPLORE
          </span>

        </div>

        {/* =================================================
            PROGRESS
        ================================================= */}

        <div className="carcraft-progress">

          <span className="progress-active">
            {
              sections[
                activeSection
              ].number
            }
          </span>

          <span className="progress-line" />

          {sections.map(
            (section, index) => (
              <button
                key={section.id}
                type="button"
                className={
                  activeSection === index
                    ? "progress-active"
                    : ""
                }
                onClick={() =>
                  scrollToSection(
                    index
                  )
                }
              >
                {section.number}
              </button>
            )
          )}

        </div>

      </div>

    </main>
  );
}