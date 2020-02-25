const pg = require('pg');
require('dotenv').config();

const config = {
    user: process.env.SQL_USER,
    host: process.env.SQL_HOST,
    database: process.env.SQL_DATABASE,
    port: process.env.SQL_PORT
};

const pool = new pg.Pool(config);

ft_init()
console.log("Creating pictures...")
async function ft_init() {

    await pool.connect(async function (err, client, done) {
        for (let index = 1; index <= 500; index++) {
            var query = "SELECT id, gender FROM accounts WHERE id = " + index + ";"
            await client.query(query, async (err, res) => {

                var gender = res.rows[0].gender

                if (gender === "M") {
                    if (index % 2 === 0) {
                        var url_profile = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Emmanuel_Macron_in_2019.jpg/220px-Emmanuel_Macron_in_2019.jpg"
                        var query = "INSERT INTO pictures (id_account, url_picture, profile_picture, date_created) VALUES (" + res.rows[0].id + ", \'" + url_profile + "\', true, \'" + Date() + "\')"
                        var req = await client.query(query)
                        var url_picture = "https://www.vanityfair.fr/uploads/images/thumbs/201950/00/vf_macron_col_slider_1738.jpeg_north_375x310_.jpg"
                        await client.query("INSERT INTO pictures (id_account, url_picture, profile_picture, date_created) VALUES (" + res.rows[0].id + ", \'" + url_picture + "\', false, \'" + Date() + "\')")
                        var url_picture = "https://s.yimg.com/ny/api/res/1.2/gwkIKhCc2nZ_expiGUyOmQ--/YXBwaWQ9aGlnaGxhbmRlcjt3PTY0MDtoPTQ4MA--/https://s.yimg.com/uu/api/res/1.2/AJj._IYj1Iez0IXPKkXZlg--~B/aD05MDA7dz0xMjAwO3NtPTE7YXBwaWQ9eXRhY2h5b24-/https://media.zenfs.com/fr/gala.fr/0998c8511170c925c2478884f6ec234b"
                        await client.query("INSERT INTO pictures (id_account, url_picture, profile_picture, date_created) VALUES (" + res.rows[0].id + ", \'" + url_picture + "\', false, \'" + Date() + "\')")
                    }
                    else {
                        var url_profile = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Donald_Trump_official_portrait.jpg/1200px-Donald_Trump_official_portrait.jpg"
                        await client.query("INSERT INTO pictures (id_account, url_picture, profile_picture, date_created) VALUES (" + res.rows[0].id + ", \'" + url_profile + "\', true, \'" + Date() + "\')")
                        var url_picture = "https://img.huffingtonpost.com/asset/5e1e2a1021000054001f6ef8.jpeg?cache=VcrrWr6faw&ops=crop_304_147_4170_2524,scalefit_630_noupscale"
                        await client.query("INSERT INTO pictures (id_account, url_picture, profile_picture, date_created) VALUES (" + res.rows[0].id + ", \'" + url_picture + "\', false, \'" + Date() + "\')")
                        var url_picture = "https://media.ouest-france.fr/v1/pictures/MjAxOTEwMzI4Yjk4ZTQ5Yjc1NjEwNWZhZmY3ZDZiMzhkODcyM2Q?width=480&height=270&focuspoint=50%2C45&cropresize=1&client_id=bpeditorial&sign=ff77cc2ad640f62f56d45f940f0e6af26a0f04d43bd39a99fa345ded12434738"
                        await client.query("INSERT INTO pictures (id_account, url_picture, profile_picture, date_created) VALUES (" + res.rows[0].id + ", \'" + url_picture + "\', false, \'" + Date() + "\')")
                    }
                } else {
                    if (index % 2 === 0) {
                        var url_profile = "https://france3-regions.francetvinfo.fr/paris-ile-de-france/sites/regions_france3/files/styles/top_big/public/assets/images/genevieve-face.jpg?itok=rPHqS8Ko"
                        await client.query("INSERT INTO pictures (id_account, url_picture, profile_picture, date_created) VALUES (" + res.rows[0].id + ", \'" + url_profile + "\', true, \'" + Date() + "\')")
                        var url_picture = "https://file1.closermag.fr/var/closermag/storage/images/1/2/9/8/5/12985156/genevieve-fontenay-.-soiree-remise-des-prix-trofemina-2014-salle-wagram-.-guillaume-gaf.jpg?alias=width400&size=x100&format=jpeg"
                        await client.query("INSERT INTO pictures (id_account, url_picture, profile_picture, date_created) VALUES (" + res.rows[0].id + ", \'" + url_picture + "\', false, \'" + Date() + "\')")
                        var url_picture = "https://resize-pdm.francedimanche.ladmedia.fr/rcrop/635,500/img/2019-03/genevie-ve-11.png?version=v1"
                        await client.query("INSERT INTO pictures (id_account, url_picture, profile_picture, date_created) VALUES (" + res.rows[0].id + ", \'" + url_picture + "\', false, \'" + Date() + "\')")

                    }
                    else {
                        var url_profile = "https://www.alliancy.fr/wp-content/uploads/2018/10/sophie-ecole-42.jpg"
                        await client.query("INSERT INTO pictures (id_account, url_picture, profile_picture, date_created) VALUES (" + res.rows[0].id + ", \'" + url_profile + "\', true, \'" + Date() + "\')")
                        var url_picture = "https://i.f1g.fr/media/madame/orig/sites/default/files/img/2018/10/sophie-viger.jpg"
                        await client.query("INSERT INTO pictures (id_account, url_picture, profile_picture, date_created) VALUES (" + res.rows[0].id + ", \'" + url_picture + "\', false, \'" + Date() + "\')")
                        var url_picture = "https://start.lesechos.fr/images/2019/10/22/16421_1571755462_sophie_970x545p.jpg"
                        await client.query("INSERT INTO pictures (id_account, url_picture, profile_picture, date_created) VALUES (" + res.rows[0].id + ", \'" + url_picture + "\', false, \'" + Date() + "\')")
                    }
                }
                
                
            })
        }
        done()
    })
}