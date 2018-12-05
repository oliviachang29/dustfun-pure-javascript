/*
 * Copyright (c) 2006-2007 Erin Catto http://www.box2d.org
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

/**
 * @export
 * @return {number}
 * @param {Array.<*>=} args
 */

let world
let touchingParticles = []
let particleNormals = {}
var x = 1

function mainApp(args) {

    function onload() {

        var gravity = new box2d.b2Vec2(0, 10); // gravity amount in x, y
        world = new box2d.b2World(gravity);
        Renderer = new Renderer(world)

        var particleSystemDef = new box2d.b2ParticleSystemDef();
        world.CreateParticleSystem(particleSystemDef);

        createBoxBody(0, 5, .1, 10) // leftwall
        createBoxBody(5, 0, 10, .1) // to
        createBoxBody(10, 5, .1, 10) // right wall
        createBoxBody(5, 10, 10, .1)

        var circle = new box2d.b2CircleShape(0.5); // pass in circle radius
        var pgd = new box2d.b2ParticleGroupDef();
        pgd.groupFlags = box2d.b2_rigidParticleGroup;
        // pgd.flags = box2d.b2ParticleFlag.b2_wallParticle | box2d.b2ParticleFlag.b2_barrierParticle;
        // pgd.flags = box2d.b2ParticleFlag.b2_solidParticleGroup;
        pgd.position = new box2d.b2Vec2(5, 5)
        pgd.shape = circle;
        pgd.strength = 1;
        pgd.color.Set(255, 0, 0, 255);
        // make it move
        pgd.linearVelocity = (new box2d.b2Vec2(180, 100)); // degrees, speed+direction
        world.GetParticleSystemList().SetRadius(0.5) // size of particle
        ball = world.GetParticleSystemList().CreateParticleGroup(pgd);

        var box1 = new box2d.b2PolygonShape();
        pgd = new box2d.b2ParticleGroupDef;
        box1.SetAsBox(0.5, 5, new box2d.b2Vec2(7.5, 5), 0);
        pgd.strength = 1.0;
        pgd.groupFlags = box2d.b2_rigidParticleGroup;
        pgd.flags = box2d.b2ParticleFlag.b2_wallParticle | box2d.b2ParticleFlag.b2_barrierParticle;
        pgd.shape = box1;
        pgd.color.Set(0, 0, 255, 255);
        world.GetParticleSystemList().SetRadius(0.1)
        wall = world.GetParticleSystemList().CreateParticleGroup(pgd);

        requestAnimationFrame(gameLoop);

        document.addEventListener('keydown', (event) => {
            const lastIndex = ball.m_lastIndex - 1
            const firstIndex = ball.m_firstIndex
            const length = lastIndex - firstIndex
            const particleSystem = world.GetParticleSystemList()
            // const vecFirst = world.GetParticleSystemList().GetParticlePositionBuffer()[firstIndex]
            // const vecLast= world.GetParticleSystemList().GetParticlePositionBuffer()[lastIndex]
            // const newVec = new box2d.b2Vec2(vecFirst.x-vecLast.x, vecFirst.y-vecLast.y).Multiply(5)
            // newVec = new box2d.b2Vec2(0,-10)

            // get contacting bodies
            oppositeBodyPoints = touchingParticles.map(particle => {
                return particleSystem.GetPositionBuffer()[28 - particle] // why 28?
            })

            touchingParticlePoints = touchingParticles.map(index => {
                return particleSystem.GetPositionBuffer()[index]
            })

            let distancePoints = []
            for (var i = 0; i < touchingParticlePoints.length; i++) {
                distancePoints.push(box2d.b2Distance(oppositeBodyPoints[i],
                    touchingParticlePoints[i]
                ))
            }

            for (var i = 0; i < distancePoints.length; i++) {

                let particleIndex = touchingParticles[i]
                let dp = -distancePoints[i]
                if (!dp) dp = .5 // on the odd chance it is 14, they have the same point
                const multiple = .7 / dp


                console.log(multiple)
                const impulse = particleNormals[particleIndex].SelfMul(multiple) // equals the normalized vector * the distance

                particleSystem.ParticleApplyLinearImpulse(
                    particleIndex,
                    impulse // doesn't this mean it's going up by less the shorter it is, isn't that the opposite of what we want? oh well,
                ) // For now, just apply straight up

            }
        });

        var listener = new box2d.b2ContactListener;

        listener.BeginContact = function(contact) {
            var fixtureA = contact.GetFixtureA();
            var fixtureB = contact.GetFixtureB()
        }

        world.SetContactListener(listener)

    }


    function createCircleBody(x, y) {
        var bd = new box2d.b2BodyDef();
        // circle
        bd = new box2d.b2BodyDef()
        bd.userData = { circle: true }
        circle = new box2d.b2CircleShape(.1);
        bd.type = box2d.b2Body.box2d.b2_dynamicBody;
        bd.position.Set(x, y)
        var body = world.CreateBody(bd);
        fixtureDef = body.CreateFixture(circle, 0.5);
        fixtureDef.userData = { type: "circle" }
        fixtureDef.SetRestitution(.5)
    }

    function createBoxBody(x, y, width, height, angle = 0) {

        // Create our body definition
        var groundBodyDef = new box2d.b2BodyDef();
        // Set its world position
        groundBodyDef.position.Set(x, y);

        // Create a body from the defintion and add it to the world
        var groundBody = world.CreateBody(groundBodyDef);

        // Create a polygon shape
        var groundBox = new box2d.b2PolygonShape();
        // Set the polygon shape as a box which is twice the size of our view port and 20 high
        groundBox.SetAsBox(width, height, new box2d.b2Vec2(0, 0), angle);
        // Create a fixture from our polygon shape and add it to our ground body  
        fixtureDef = groundBody.CreateFixture(groundBox, 0.0);
        fixtureDef.userData = { type: "square" }
    }

    lastFrame = new Date().getTime();

    const gameLoop = function() {
        var tm = new Date().getTime();
        requestAnimationFrame(gameLoop);
        var dt = (tm - lastFrame) / 1000;
        if (dt > 1 / 15) { dt = 1 / 15; }
        update(dt);
        lastFrame = tm;
    };

    function update() {
        touchingParticles.length = 0
        world.GetParticleSystemList().m_bodyContactBuffer = new box2d.b2GrowableBuffer(function() {
            return new box2d.b2ParticleBodyContact();
        });

        world.Step(1 / 40, 10, 10)
        getTouchingParticles()

        Renderer.render()
    }

    function getTouchingParticles() {
        particleNormals = {}
        const system = world.GetParticleSystemList()
        bodyContacts = system.GetBodyContacts()

        const contacts = bodyContacts.filter(particle => {
          console.log(particle)
          return particle.body
        })

        bodyContacts.forEach(contact => {
            particleNormals[contact.index] = contact.normal
        })

        contacts.forEach(contact => {
            // contact.flags = (box2d.b2ParticleFlag.b2_powderParticle)
            // world.GetParticleSystemList().DestroyParticle(contact.index)
            touchingParticles.push(contact.index)
        });
    }



    onload();
}