const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://localhost:27017/sis';
const ATLAS_URI = 'mongodb+srv://sisadmin:SIS2024Secure!@cluster0.6imbc1c.mongodb.net/sis?retryWrites=true&w=majority&appName=Cluster0';

const COLLECTIONS = ['users', 'students', 'teachers', 'courses', 'enrollments', 'attendances', 'marks'];

async function migrate() {
    console.log('\n🚀 Starting Migration: Local MongoDB → Atlas\n');

    // Connect to local MongoDB
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Connected to Local MongoDB');

    // Connect to Atlas
    const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('✅ Connected to MongoDB Atlas\n');

    let totalMigrated = 0;

    for (const collectionName of COLLECTIONS) {
        try {
            const localCollection = localConn.collection(collectionName);
            const atlasCollection = atlasConn.collection(collectionName);

            // Get all documents from local
            const docs = await localCollection.find({}).toArray();

            if (docs.length === 0) {
                console.log(`⏭️  ${collectionName}: empty, skipping`);
                continue;
            }

            // Clear existing data in Atlas collection
            await atlasCollection.deleteMany({});

            // Insert all docs into Atlas
            await atlasCollection.insertMany(docs);

            console.log(`✅ ${collectionName}: migrated ${docs.length} records`);
            totalMigrated += docs.length;
        } catch (err) {
            console.log(`❌ ${collectionName}: failed - ${err.message}`);
        }
    }

    console.log(`\n🎉 Migration complete! Total records migrated: ${totalMigrated}`);
    console.log('\n📋 Summary of Atlas collections:');

    for (const collectionName of COLLECTIONS) {
        try {
            const atlasCollection = atlasConn.collection(collectionName);
            const count = await atlasCollection.countDocuments();
            console.log(`   ${collectionName}: ${count} records`);
        } catch (err) {
            // skip
        }
    }

    await localConn.close();
    await atlasConn.close();
    console.log('\n✅ Done! Your Atlas database now has all your data.');
    process.exit(0);
}

migrate().catch(err => {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
});
