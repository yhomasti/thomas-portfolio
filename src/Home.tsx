import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import SockModel from './public/models/sockModelglb.glb';
import './style.css';
import './mediaqueries.css';

export default function Home() {
  return (
    <>
      <nav id="desktop-nav">
        <div className="logo-container">
          <div className="logo-3d">
            <Canvas camera={{ position: [0, 0, 3] }} style={{ height: '80px', width: '80px' }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[3, 3, 3]} />
              <Suspense fallback={null}>
                <SockModel />
              </Suspense>
              <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
          </div>
          <a href="#" className="logo-text">Thomas Yi</a>
        </div>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#code">Code</a></li>
          <li><a href="#art">Art</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      <section id="profile">
        <div className="section__text">
          <p className="section__text__p1">Hello! I am...</p>
          <h1 className="title">Thomas Yi</h1>
          <p className="section__text__p2">Programmer and 3D Artist</p>
          <div className="btn-container">
            <button className="btn btn-color-2" onClick={() => window.open('./assets/Thomas_Yi.pdf')}>Resume</button>
            <button className="btn btn-color-1" onClick={() => location.href='#contact'}>Contact</button>
          </div>
          <div id="socials-container">
            <img src="./assets/linkedin.png" alt="LinkedIn" className="icon" onClick={() => window.location.href='https://www.linkedin.com/in/yhomasti/'} />
            <img src="./assets/email.png" alt="Email" className="icon" onClick={() => window.location.href='mailto:thomasyi2005@gmail.com'} />
          </div>
        </div>
        <div className="section__pic-container">
          <img src="./assets/sock-profile.png" alt="Profile" />
        </div>
      </section>

      <section id="about">
  <p className="section__text__p1">Learn more...</p>
  <h1 className="title"> About Me!</h1>
  <div className="section-container">
    <div className="section__pic-container">
      <img
        src="./assets/thomas-profile1-circle.png"
        alt="Profile picture"
        className="about-pic"
      />
    </div>
    <div className="about-details-container">
      <div className="about-containers">
        <div className="details-container">
          <img
            src="./assets/sock-profile.png"
            alt="Experience icon"
            className="icon"
          />
          <h3>About Thomas:</h3>
          <p>
            I'm Thomas Yi, and I'm a student at Northeastern University
            pursuing a combined degree in Computer Science and Media Arts. I
            have a passion for telling stories and finding ways to express
            them, and I believe everyone should express their childish side
            every so often in their work. I am always looking for a chance to
            grow and learn more while pushing others and myself to be the best
            version of themselves that they can be.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="code">
  <p className="section__text__p1">Check out my Recent...</p>
  <h1 className="title">Coding Projects</h1>
  <div className="experience-details-container">
    <div className="about-containers">

      <div className="details-container color-container">
        <div className="article-container">
          <img
            src="./assets/raytraced_scene_final.png"
            alt="Raytracer"
            className="project-img"
          />
        </div>
        <h2 className="experience-sub-title">Raytracer</h2>
        <p className="project-skills">C++, OpenGL</p>
        <div className="btn-container">
          <button
            className="btn btn-color-2 project-btn"
            onClick={() =>
              window.open("https://github.com/meredithscott131/Raytracer", "_blank")
            }
          >
            Github
          </button>
        </div>
      </div>

      <div className="details-container color-container">
        <div className="article-container">
          <img
            src="./assets/ThreeTriosDemo.png"
            alt="ThreeTrios"
            className="project-img"
          />
        </div>
        <h2 className="experience-sub-title">Battle Values Card Game</h2>
        <p className="project-skills">Java, JavaSwing, JUnit, MVC, OOP</p>
        <div className="btn-container">
          <button
            className="btn btn-color-2 project-btn"
            onClick={() => window.open("https://github.com", "_blank")}
          >
            Github
          </button>
        </div>
      </div>

      <div className="details-container color-container">
        <div className="article-container">
          <img
            src="./assets/PharmacySalesDemo.png"
            alt="Pharmacy Sales"
            className="project-img"
          />
        </div>
        <h2 className="experience-sub-title">Pharmacy Sales Database</h2>
        <p className="project-skills">R, SQL, SQLite, MySQL</p>
        <div className="btn-container">
          <button
            className="btn btn-color-2 project-btn"
            onClick={() =>
              window.open("https://github.com/yhomasti/Pharmacy-Sales-Database", "_blank")
            }
          >
            Github
          </button>
        </div>
      </div>

      <div className="details-container color-container">
        <div className="article-container">
          <img
            src="./assets/FAABirdStrikeDemo.png"
            alt="Bird Strike"
            className="project-img"
          />
        </div>
        <h2 className="experience-sub-title">FAA Bird Strikes Data Analysis</h2>
        <p className="project-skills">R (DBI, sqldf), SQL, SQLite, MySQL</p>
        <div className="btn-container">
          <button
            className="btn btn-color-2 project-btn"
            onClick={() =>
              window.open("https://github.com/yhomasti/FAA-Bird-Strikes", "_blank")
            }
          >
            Github
          </button>
        </div>
      </div>

      <div className="details-container color-container">
        <div className="article-container">
          <img
            src="./assets/WebsiteDemo.png"
            alt="Website"
            className="project-img"
          />
        </div>
        <h2 className="experience-sub-title">This Website</h2>
        <p className="project-skills">HTML, CSS, JavaScript</p>
        <div className="btn-container">
          <button
            className="btn btn-color-2 project-btn"
            onClick={() =>
              window.open("https://github.com/yhomasti/thomas-portfolio", "_blank")
            }
          >
            Github
          </button>
        </div>
      </div>

    </div>
  </div>
</section>

<section id="art">
  <p className="section__text__p1">Check out some of my...</p>
  <h1 className="title">3D Animations</h1>
  <div className="experience-details-container">
    <div className="art-containers">

      <div className="details-container color-container">
        <div className="article-container">
          <a href="/anim1">
            <video className="project-video" autoPlay loop muted playsInline>
              <source src="./assets/3D/Thomas Yi - Animation 1 Final RERENDER.mp4" type="video/mp4" />
            </video>
          </a>
        </div>
        <h2 className="experience-sub-title">"An Early April Morning"</h2>
        <p className="project-skills">Maya 2025, Substance Painter, Photoshop</p>
        <div className="btn-container">
          <button className="btn btn-color-2 project-btn" onClick={() => window.location.href = "/anim1"}>
            View Project
          </button>
        </div>
      </div>

      <div className="details-container color-container">
        <div className="article-container">
          <a href="/childhoodmisconception">
            <video className="project-video" autoPlay loop muted playsInline>
              <source src="./assets/3D/11SecondClubMarchFINAL.mp4" type="video/mp4" />
            </video>
          </a>
        </div>
        <h2 className="experience-sub-title">11 Second Club – March</h2>
        <p className="project-skills">Maya 2025</p>
        <div className="btn-container">
          <button className="btn btn-color-2 project-btn" onClick={() => window.location.href = "/childhoodmisconception"}>
            View Project
          </button>
        </div>
      </div>

      <div className="details-container color-container">
        <div className="article-container">
          <a href="/unstablecat">
            <video className="project-video" autoPlay loop muted playsInline>
              <source src="./assets/3D/UnstableDrunkCatFilm.mp4" type="video/mp4" />
            </video>
          </a>
        </div>
        <h2 className="experience-sub-title">AlcoholiCat</h2>
        <p className="project-skills">Blender</p>
        <div className="btn-container">
          <button className="btn btn-color-2 project-btn" onClick={() => window.location.href = "/unstablecat"}>
            View Project
          </button>
        </div>
      </div>

      <div className="details-container color-container">
        <div className="article-container">
          <a href="/aerialanarchy">
            <video className="project-video" autoPlay loop muted playsInline>
              <source src="./assets/3D/Talent Show COMPRESSED.mp4" type="video/mp4" />
            </video>
          </a>
        </div>
        <h2 className="experience-sub-title">"Aerial Anarchy"</h2>
        <p className="project-skills">Maya 2025, After Effects, Audition</p>
        <div className="btn-container">
          <button className="btn btn-color-2 project-btn" onClick={() => window.location.href = "/aerialanarchy"}>
            View Project
          </button>
        </div>
      </div>

      <div className="details-container color-container">
        <div className="article-container">
          <video className="project-video" autoPlay loop muted playsInline>
            <source src="./assets/3D/BoxLift.mp4" type="video/mp4" />
          </video>
        </div>
        <h2 className="experience-sub-title">Box Lift Exercise</h2>
        <p className="project-skills">Maya 2025</p>
        {/* No button for this one, per your comment */}
      </div>

    </div>
  </div>
</section>

<section id="contact">
  <p className="section__text__p1">Get in Touch</p>
  <h1 className="title">Contact Me!</h1>
  <div className="contact-info-upper-container">
    <div className="contact-info-container">
      <img
        src="./assets/email.png"
        alt="Email icon"
        className="icon contact-icon email-icon"
      />
      <p>
        <a href="mailto:thomasyi2005@gmail.com">thomasyi2005@gmail.com</a>
      </p>
    </div>
    <div className="contact-info-container">
      <img
        src="./assets/linkedin.png"
        alt="LinkedIn icon"
        className="icon contact-icon"
      />
      <p>
        <a href="https://www.linkedin.com/in/yhomasti/">LinkedIn</a>
      </p>
    </div>
  </div>
</section>
<script src="script.js"></script>
    </>
  );
}
