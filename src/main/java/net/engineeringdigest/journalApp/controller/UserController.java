package net.engineeringdigest.journalApp.controller;

//controller--> service -->entity--> repository
import net.engineeringdigest.journalApp.entity.User;
import net.engineeringdigest.journalApp.repository.UserRepository;
import net.engineeringdigest.journalApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PutMapping
    public ResponseEntity<?> updateUser(@RequestBody User user){
        Authentication authentication= SecurityContextHolder.getContext().getAuthentication();
        String userName=authentication.getName();
        User userIndb= userService.findByUserName(userName);
        
        if (user.getUsername() != null && !user.getUsername().trim().isEmpty()) {
            userIndb.setUsername(user.getUsername());
        }
        
        if (user.getPassword() != null && !user.getPassword().trim().isEmpty()) {
            userIndb.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        
        userService.saveNewEntry(userIndb);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping
    public  ResponseEntity<?> deleteUser(@RequestBody User user){
        Authentication authentication= SecurityContextHolder.getContext().getAuthentication();
        userRepository.deleteByUserName(authentication.getName());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

}
