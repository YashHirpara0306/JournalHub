package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.entity.JournalEntry;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
//here you have to write name of entity and object id

public interface JournalEntryRepository extends MongoRepository<JournalEntry, ObjectId> {
}
